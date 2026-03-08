# train_gender_silhouette.py
import os
import random
from pathlib import Path
from collections import Counter

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset, WeightedRandomSampler
from torchvision import datasets, transforms, models


# =========================
# SETTINGS
# =========================
DATASET_DIR = "dataset"
OUT_MODEL_PATH = os.path.join("models", "gender_silhouette.pt")

IMG_SIZE = 224
BATCH_SIZE = 16
VAL_SPLIT = 0.2
SEED = 42

# Two-stage training
EPOCHS_STAGE1 = 6          # head-only warmup
EPOCHS_STAGE2 = 14         # fine-tune
LR_STAGE1 = 3e-4
LR_STAGE2 = 1e-4

USE_PRETRAINED = True
USE_IMAGENET_NORM = True   # MUST be True when pretrained weights are used

# Fine-tuning control
UNFREEZE_FROM_RATIO = 0.4  # unfreeze last 60% (0.4 means start unfreezing at 40% index)
WEIGHT_DECAY = 1e-4

# Early stopping
PATIENCE = 5

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


# =========================
# HELPERS
# =========================
def set_seed(seed: int):
    random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def build_transforms(train: bool):
    # silhouettes are simple -> light augmentations help a lot
    if train:
        tf = [
            transforms.Grayscale(num_output_channels=3),
            transforms.RandomResizedCrop(IMG_SIZE, scale=(0.80, 1.0)),
            transforms.RandomRotation(6),
            transforms.RandomAffine(
                degrees=0,
                translate=(0.04, 0.04),
                scale=(0.97, 1.03),
            ),
            transforms.ToTensor(),
        ]
    else:
        tf = [
            transforms.Grayscale(num_output_channels=3),
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
        ]

    if USE_IMAGENET_NORM:
        tf.append(
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            )
        )

    return transforms.Compose(tf)


def split_indices(n: int, val_split: float, seed: int):
    idx = list(range(n))
    random.Random(seed).shuffle(idx)
    val_n = int(n * val_split)
    train_idx = idx[val_n:]
    val_idx = idx[:val_n]
    return train_idx, val_idx


def make_weighted_sampler(dataset: datasets.ImageFolder, subset_indices):
    targets = [dataset.targets[i] for i in subset_indices]
    counts = Counter(targets)
    class_weights = {c: 1.0 / counts[c] for c in counts}
    sample_weights = [class_weights[t] for t in targets]

    return WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True,
    )


def compute_class_weights(dataset: datasets.ImageFolder, subset_indices, num_classes=2):
    targets = [dataset.targets[i] for i in subset_indices]
    counts = Counter(targets)
    weights = []
    for c in range(num_classes):
        weights.append(1.0 / max(1, counts.get(c, 0)))
    w = torch.tensor(weights, dtype=torch.float32)
    # normalize (optional)
    w = w / w.sum() * num_classes
    return w


@torch.no_grad()
def confusion_matrix(model, loader, num_classes=2):
    cm = torch.zeros(num_classes, num_classes, dtype=torch.int64)
    model.eval()
    for x, y in loader:
        x = x.to(DEVICE)
        y = y.to(DEVICE)
        logits = model(x)
        pred = torch.argmax(logits, dim=1)
        for t, p in zip(y, pred):
            cm[t.item(), p.item()] += 1
    return cm


@torch.no_grad()
def eval_epoch(model, loader, criterion):
    model.eval()
    total_loss = 0.0
    total = 0
    correct = 0

    for x, y in loader:
        x = x.to(DEVICE)
        y = y.to(DEVICE)
        logits = model(x)
        loss = criterion(logits, y)

        total_loss += loss.item() * x.size(0)
        total += y.size(0)
        correct += (torch.argmax(logits, dim=1) == y).sum().item()

    avg_loss = total_loss / max(1, total)
    acc = correct / max(1, total)
    return avg_loss, acc


def set_requires_grad_features(model, req: bool):
    for p in model.features.parameters():
        p.requires_grad = req


def unfreeze_last_blocks(model, unfreeze_from_ratio: float):
    n = len(model.features)
    start = int(n * unfreeze_from_ratio)
    for i, block in enumerate(model.features):
        req = (i >= start)
        for p in block.parameters():
            p.requires_grad = req


def get_trainable_params(model):
    return [p for p in model.parameters() if p.requires_grad]


# =========================
# MAIN
# =========================
def main():
    set_seed(SEED)

    dataset_path = Path(DATASET_DIR)
    if not (dataset_path / "male").exists() or not (dataset_path / "female").exists():
        raise FileNotFoundError("Need dataset/male and dataset/female folders")

    train_tf = build_transforms(train=True)
    val_tf = build_transforms(train=False)

    # IMPORTANT: classes order is alphabetical by folder name
    train_like = datasets.ImageFolder(DATASET_DIR, transform=train_tf)
    classes = train_like.classes
    print("✅ Classes:", classes)

    if len(classes) != 2:
        raise Exception(f"Expected 2 classes, got {len(classes)}: {classes}")

    train_idx, val_idx = split_indices(len(train_like), VAL_SPLIT, SEED)

    train_ds = Subset(train_like, train_idx)
    val_like = datasets.ImageFolder(DATASET_DIR, transform=val_tf)
    val_ds = Subset(val_like, val_idx)

    # sampler (balanced batches)
    sampler = make_weighted_sampler(train_like, train_idx)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, sampler=sampler, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # model
    weights = models.MobileNet_V2_Weights.DEFAULT if USE_PRETRAINED else None
    model = models.mobilenet_v2(weights=weights)
    model.classifier[1] = nn.Linear(model.last_channel, 2)
    model = model.to(DEVICE)

    # class weights for loss (extra stability)
    class_w = compute_class_weights(train_like, train_idx, num_classes=2).to(DEVICE)
    criterion = nn.CrossEntropyLoss(weight=class_w)

    best_val_acc = 0.0
    best_epoch = 0
    bad_epochs = 0

    def save_ckpt(val_acc: float):
        os.makedirs(os.path.dirname(OUT_MODEL_PATH), exist_ok=True)
        ckpt = {
            "model_state": model.state_dict(),
            "classes": classes,
            "img_size": IMG_SIZE,
            "use_imagenet_norm": USE_IMAGENET_NORM,
        }
        torch.save(ckpt, OUT_MODEL_PATH)
        print(f"✅ Saved BEST -> {OUT_MODEL_PATH} (val_acc={val_acc:.3f})")

    # =========================
    # STAGE 1: Train HEAD ONLY
    # =========================
    print("\n====================")
    print("STAGE 1: head-only warmup")
    print("====================")

    set_requires_grad_features(model, False)
    for p in model.classifier.parameters():
        p.requires_grad = True

    optimizer = torch.optim.AdamW(get_trainable_params(model), lr=LR_STAGE1, weight_decay=WEIGHT_DECAY)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    for epoch in range(1, EPOCHS_STAGE1 + 1):
        model.train()
        tr_loss = 0.0
        tr_correct = 0
        tr_total = 0

        for x, y in train_loader:
            x = x.to(DEVICE)
            y = y.to(DEVICE)

            optimizer.zero_grad()
            logits = model(x)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()

            tr_loss += loss.item() * x.size(0)
            tr_correct += (torch.argmax(logits, dim=1) == y).sum().item()
            tr_total += y.size(0)

        tr_loss /= max(1, tr_total)
        tr_acc = tr_correct / max(1, tr_total)

        va_loss, va_acc = eval_epoch(model, val_loader, criterion)
        scheduler.step(va_loss)

        print(
            f"[S1] Epoch {epoch:02d}/{EPOCHS_STAGE1} | "
            f"train_loss={tr_loss:.4f} train_acc={tr_acc:.3f} | "
            f"val_loss={va_loss:.4f} val_acc={va_acc:.3f}"
        )

        if va_acc > best_val_acc:
            best_val_acc = va_acc
            best_epoch = epoch
            bad_epochs = 0
            save_ckpt(best_val_acc)
        else:
            bad_epochs += 1

    # =========================
    # STAGE 2: Fine-tune last blocks
    # =========================
    print("\n====================")
    print("STAGE 2: fine-tune backbone")
    print("====================")

    unfreeze_last_blocks(model, UNFREEZE_FROM_RATIO)
    # classifier is already trainable

    optimizer = torch.optim.AdamW(get_trainable_params(model), lr=LR_STAGE2, weight_decay=WEIGHT_DECAY)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    bad_epochs = 0
    for epoch in range(1, EPOCHS_STAGE2 + 1):
        model.train()
        tr_loss = 0.0
        tr_correct = 0
        tr_total = 0

        for x, y in train_loader:
            x = x.to(DEVICE)
            y = y.to(DEVICE)

            optimizer.zero_grad()
            logits = model(x)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()

            tr_loss += loss.item() * x.size(0)
            tr_correct += (torch.argmax(logits, dim=1) == y).sum().item()
            tr_total += y.size(0)

        tr_loss /= max(1, tr_total)
        tr_acc = tr_correct / max(1, tr_total)

        va_loss, va_acc = eval_epoch(model, val_loader, criterion)
        scheduler.step(va_loss)

        print(
            f"[S2] Epoch {epoch:02d}/{EPOCHS_STAGE2} | "
            f"train_loss={tr_loss:.4f} train_acc={tr_acc:.3f} | "
            f"val_loss={va_loss:.4f} val_acc={va_acc:.3f}"
        )

        # confusion matrix every 5 epochs
        if epoch % 5 == 0:
            cm = confusion_matrix(model, val_loader, num_classes=2)
            print("Confusion matrix (rows=true, cols=pred):\n", cm)

            # per-class accuracy
            for c in range(2):
                denom = cm[c].sum().item()
                acc_c = (cm[c, c].item() / denom) if denom > 0 else 0.0
                print(f"  class '{classes[c]}' acc: {acc_c:.3f}")

        if va_acc > best_val_acc:
            best_val_acc = va_acc
            best_epoch = EPOCHS_STAGE1 + epoch
            bad_epochs = 0
            save_ckpt(best_val_acc)
        else:
            bad_epochs += 1
            if bad_epochs >= PATIENCE:
                print(f"🛑 Early stop: no improvement for {PATIENCE} epochs.")
                break

    print("\n✅ Training done.")
    print(f"Best val acc: {best_val_acc:.3f} (at epoch {best_epoch})")
    print("Now test with: python gender_model_infer.py")


if __name__ == "__main__":
    main()

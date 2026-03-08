# mp_compat.py
"""
MediaPipe compatibility shim.

Some MediaPipe builds expose `mediapipe.tasks` but do not expose `mediapipe.solutions`
at the top-level (`mp.solutions`).

This file patches `mp.solutions` if possible, so old code using `mp.solutions.*`
won't crash.
"""

import mediapipe as mp  # noqa

# Patch mp.solutions if missing
if not hasattr(mp, "solutions"):
    try:
        import mediapipe.python.solutions as _solutions  # type: ignore
        mp.solutions = _solutions  # type: ignore
    except Exception:
        # If this import fails, then this mediapipe build truly has no solutions package.
        # In that case, you MUST remove all mp.solutions usage from your project.
        pass

# Export patched mp
__all__ = ["mp"]

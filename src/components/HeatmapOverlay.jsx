"use client";

import React, { useEffect, useRef } from "react";

const HeatmapOverlay = ({ analysisData = [], width = 400, height = 600 }) => {

  const canvasRef = useRef(null);

  const getHeatColor = (diff, alpha = 0.7) => {

    if (diff < -1) return `rgba(255,50,60,${alpha})`;
    if (diff < 0) return `rgba(255,165,40,${alpha})`;
    if (diff < 0.5) return `rgba(40,210,95,${alpha})`;

    return `rgba(40,120,255,${alpha})`;
  };

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr,0,0,dpr,0,0);

    ctx.clearRect(0,0,width,height);

    const zoneMap = {

      Shoulders:{cx:width/2,cy:height*0.28,rx:width*0.16,ry:height*0.06},
      "Upper Chest":{cx:width/2,cy:height*0.36,rx:width*0.20,ry:height*0.07},
      Torso:{cx:width/2,cy:height*0.52,rx:width*0.22,ry:height*0.12},
      Collar:{cx:width/2,cy:height*0.21,rx:width*0.10,ry:height*0.04},
      "Neck Base":{cx:width/2,cy:height*0.24,rx:width*0.09,ry:height*0.035}

    };

    const drawZone=(cx,cy,rx,ry,color)=>{

      const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(rx,ry));

      grad.addColorStop(0,color);
      grad.addColorStop(1,"rgba(0,0,0,0)");

      ctx.fillStyle=grad;

      ctx.beginPath();
      ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
      ctx.fill();
    };

    analysisData.forEach(zone=>{

      const def=zoneMap[zone.name];
      if(!def) return;

      const color=getHeatColor(zone.diff??0);

      if(zone.name==="Shoulders"){

        drawZone(width/2-width*0.22,def.cy,def.rx,def.ry,color);
        drawZone(width/2+width*0.22,def.cy,def.rx,def.ry,color);

      }else{

        drawZone(def.cx,def.cy,def.rx,def.ry,color);

      }

    });

  },[analysisData,width,height]);

  return (

    <canvas
      ref={canvasRef}
      style={{
        position:"absolute",
        inset:0,
        pointerEvents:"none",
        zIndex:10
      }}
    />

  );

};

export default HeatmapOverlay;
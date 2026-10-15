/**
 * SQUID TRACE - 9 Ranked Shapes (Difficulty 1 to 9)
 * Premium Black + Gold Survival Arena Wireframe Renderers
 */

export const SHAPES = {
  1: {
    level: 1,
    name: "Rhombus",
    threshold: 70,
    difficultyLabel: "Novice",
    expectedTurns: 4,
    aspectRatio: 1.0,
    color: "#FFC857",
    description: "Equilateral diamond with four equal sides and 4 distinct vertices.",
    draw: (ctx, cx, cy, size = 45, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#FFC857";
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size * 0.85, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size * 0.85, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },
    getTemplatePoints: () => [
      { x: 0, y: -1 },
      { x: 0.85, y: 0 },
      { x: 0, y: 1 },
      { x: -0.85, y: 0 },
      { x: 0, y: -1 }
    ]
  },

  2: {
    level: 2,
    name: "Star",
    threshold: 75,
    difficultyLabel: "Trainee",
    expectedTurns: 10,
    aspectRatio: 1.0,
    color: "#FFC857",
    description: "Classic 5-point celestial star with 10 alternating tips and valleys.",
    draw: (ctx, cx, cy, size = 45, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#FFC857";
      ctx.beginPath();
      const points = 5;
      const outerR = size;
      const innerR = size * 0.42;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },
    getTemplatePoints: () => {
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const r = i % 2 === 0 ? 1 : 0.42;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        pts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
      }
      return pts;
    }
  },

  3: {
    level: 3,
    name: "Triangular Prism",
    threshold: 80,
    difficultyLabel: "Challenger",
    expectedTurns: 6,
    aspectRatio: 1.1,
    color: "#FFC857",
    description: "3D wireframe solid composed of two parallel triangles connected by 3 edges.",
    draw: (ctx, cx, cy, size = 40, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#FFC857";
      
      const front = [
        { x: cx, y: cy - size * 0.75 },
        { x: cx + size * 0.65, y: cy + size * 0.5 },
        { x: cx - size * 0.65, y: cy + size * 0.5 }
      ];

      const offset = size * 0.45;
      const back = [
        { x: front[0].x + offset, y: front[0].y - offset * 0.6 },
        { x: front[1].x + offset, y: front[1].y - offset * 0.6 },
        { x: front[2].x + offset, y: front[2].y - offset * 0.6 }
      ];

      // Draw front triangle
      ctx.beginPath();
      ctx.moveTo(front[0].x, front[0].y);
      ctx.lineTo(front[1].x, front[1].y);
      ctx.lineTo(front[2].x, front[2].y);
      ctx.closePath();
      ctx.stroke();

      // Draw back triangle
      ctx.beginPath();
      ctx.moveTo(back[0].x, back[0].y);
      ctx.lineTo(back[1].x, back[1].y);
      ctx.lineTo(back[2].x, back[2].y);
      ctx.closePath();
      ctx.stroke();

      // Connect vertices
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(front[i].x, front[i].y);
        ctx.lineTo(back[i].x, back[i].y);
        ctx.stroke();
      }

      ctx.restore();
    },
    getTemplatePoints: () => [
      { x: 0, y: -0.7 }, { x: 0.6, y: 0.5 }, { x: -0.6, y: 0.5 }, { x: 0, y: -0.7 },
      { x: 0.4, y: -1.0 }, { x: 1.0, y: 0.2 }, { x: 0.6, y: 0.5 }
    ]
  },

  4: {
    level: 4,
    name: "Pentagonal Pyramid",
    threshold: 82,
    difficultyLabel: "Hardened",
    expectedTurns: 6,
    aspectRatio: 0.95,
    color: "#FFC857",
    description: "3D wireframe pyramid with a 5-sided base converging upward to a sharp apex.",
    draw: (ctx, cx, cy, size = 44, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#FFC857";

      const apex = { x: cx, y: cy - size * 0.9 };
      const basePts = [];
      const numSides = 5;
      const baseR = size * 0.8;
      for (let i = 0; i < numSides; i++) {
        const a = (i * 2 * Math.PI) / numSides + Math.PI / 10;
        basePts.push({
          x: cx + baseR * Math.cos(a),
          y: cy + size * 0.35 + baseR * 0.45 * Math.sin(a)
        });
      }

      // Draw base
      ctx.beginPath();
      basePts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Draw edges to apex
      basePts.forEach(pt => {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(apex.x, apex.y);
        ctx.stroke();
      });

      // Internal depth lines
      ctx.beginPath();
      ctx.moveTo(basePts[0].x, basePts[0].y);
      ctx.lineTo(basePts[2].x, basePts[2].y);
      ctx.strokeStyle = "rgba(255, 200, 87, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    },
    getTemplatePoints: () => {
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5 + Math.PI / 10;
        pts.push({ x: 0.8 * Math.cos(a), y: 0.35 + 0.35 * Math.sin(a) });
      }
      pts.push(pts[0]);
      pts.push({ x: 0, y: -0.9 });
      return pts;
    }
  },

  5: {
    level: 5,
    name: "Umbrella",
    threshold: 85,
    difficultyLabel: "Dalgona Master",
    expectedTurns: 6,
    aspectRatio: 1.0,
    color: "#FFC857",
    description: "The iconic Squid Game honeycomb umbrella: arched dome, scalloped rim, and curved handle hook.",
    draw: (ctx, cx, cy, size = 44, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#FFC857";

      // Canopy dome (upper arc)
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.2, size * 0.85, Math.PI, 0, false);
      ctx.stroke();

      // Scalloped bottom rim (3 mini scallops)
      const r = size * 0.85;
      const startX = cx - r;
      const step = (2 * r) / 3;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const sx = startX + i * step;
        const mx = sx + step / 2;
        ctx.arc(mx, cy - size * 0.2, step / 2, Math.PI, 0, true);
      }
      ctx.stroke();

      // Stem handle
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.2);
      ctx.lineTo(cx, cy + size * 0.65);
      // Hook
      ctx.arc(cx - size * 0.18, cy + size * 0.65, size * 0.18, 0, Math.PI, false);
      ctx.stroke();

      // Tip at top
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 1.05);
      ctx.lineTo(cx, cy - size * 0.85);
      ctx.stroke();

      ctx.restore();
    },
    getTemplatePoints: () => {
      const pts = [];
      for (let a = Math.PI; a >= 0; a -= Math.PI / 10) {
        pts.push({ x: 0.85 * Math.cos(a), y: -0.2 - 0.85 * Math.sin(a) });
      }
      pts.push({ x: 0.85, y: -0.2 });
      pts.push({ x: 0, y: -0.2 });
      pts.push({ x: 0, y: 0.65 });
      pts.push({ x: -0.36, y: 0.65 });
      return pts;
    }
  },

  6: {
    level: 6,
    name: "Butterfly",
    threshold: 88,
    difficultyLabel: "Veteran",
    expectedTurns: 8,
    aspectRatio: 1.1,
    color: "#FFC857",
    description: "Four symmetrical curved wing lobes with a slender central thorax and antennae.",
    draw: (ctx, cx, cy, size = 42, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#FFC857";

      // Central body
      ctx.beginPath();
      ctx.ellipse(cx, cy, 3, size * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Antennae
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - size * 0.45);
      ctx.quadraticCurveTo(cx - 10, cy - size * 0.8, cx - 14, cy - size * 0.7);
      ctx.moveTo(cx + 2, cy - size * 0.45);
      ctx.quadraticCurveTo(cx + 10, cy - size * 0.8, cx + 14, cy - size * 0.7);
      ctx.stroke();

      // Upper wings
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.45, cy - size * 0.25, size * 0.45, size * 0.55, -0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx + size * 0.45, cy - size * 0.25, size * 0.45, size * 0.55, 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Lower wings
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.35, cy + size * 0.35, size * 0.35, size * 0.38, 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx + size * 0.35, cy + size * 0.35, size * 0.35, size * 0.38, -0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },
    getTemplatePoints: () => [
      { x: 0, y: -0.5 }, { x: -0.9, y: -0.3 }, { x: -0.4, y: 0.1 },
      { x: -0.7, y: 0.6 }, { x: 0, y: 0.5 }, { x: 0.7, y: 0.6 },
      { x: 0.4, y: 0.1 }, { x: 0.9, y: -0.3 }, { x: 0, y: -0.5 }
    ]
  },

  7: {
    level: 7,
    name: "Octagram",
    threshold: 90,
    difficultyLabel: "Elite",
    expectedTurns: 16,
    aspectRatio: 1.0,
    color: "#FFC857",
    description: "An intricate 8-pointed star constructed from two congruent concentric squares rotated by 45°.",
    draw: (ctx, cx, cy, size = 44, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#FFC857";

      // Square 1 (Axis aligned)
      const s = size * 0.75;
      ctx.strokeRect(cx - s, cy - s, s * 2, s * 2);

      // Square 2 (Rotated 45 degrees)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.restore();

      ctx.restore();
    },
    getTemplatePoints: () => {
      const pts = [];
      const s = 0.75;
      for (let i = 0; i <= 8; i++) {
        const a = (i * 2 * Math.PI) / 8 - Math.PI / 8;
        const r = (i % 2 === 0) ? s * 1.414 : s;
        pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
      }
      return pts;
    }
  },

  8: {
    level: 8,
    name: "Nonagon",
    threshold: 92,
    difficultyLabel: "Master",
    expectedTurns: 9,
    aspectRatio: 1.0,
    color: "#FFC857",
    description: "Regular 9-sided polygon requiring consistent curvature and equidistant vertex turning points.",
    draw: (ctx, cx, cy, size = 44, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#FFC857";

      const sides = 9;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = cx + size * Math.cos(a);
        const y = cy + size * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },
    getTemplatePoints: () => {
      const pts = [];
      for (let i = 0; i <= 9; i++) {
        const a = (i * 2 * Math.PI) / 9 - Math.PI / 2;
        pts.push({ x: Math.cos(a), y: Math.sin(a) });
      }
      return pts;
    }
  },

  9: {
    level: 9,
    name: "Icosahedron",
    threshold: 95,
    difficultyLabel: "V.I.P. Tier",
    expectedTurns: 12,
    aspectRatio: 1.0,
    color: "#FFC857",
    description: "The ultimate survival challenge: A complex 20-faced 3D polyhedron network with hexagonal frame and internal vertex lattice.",
    draw: (ctx, cx, cy, size = 44, color = "#FFC857", lineWidth = 2.5) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#FFC857";

      // Outer regular hexagon
      const outerPts = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * 2 * Math.PI) / 6;
        outerPts.push({
          x: cx + size * Math.cos(a),
          y: cy + size * Math.sin(a)
        });
      }

      ctx.beginPath();
      outerPts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Inner triangular network
      const innerR = size * 0.45;
      const innerPts = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * 2 * Math.PI) / 6 + Math.PI / 6;
        innerPts.push({
          x: cx + innerR * Math.cos(a),
          y: cy + innerR * Math.sin(a)
        });
      }

      ctx.beginPath();
      innerPts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Connect outer and inner vertices
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(outerPts[i].x, outerPts[i].y);
        ctx.lineTo(innerPts[i].x, innerPts[i].y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(outerPts[(i + 1) % 6].x, outerPts[(i + 1) % 6].y);
        ctx.lineTo(innerPts[i].x, innerPts[i].y);
        ctx.stroke();
      }

      ctx.restore();
    },
    getTemplatePoints: () => {
      const pts = [];
      for (let i = 0; i <= 6; i++) {
        const a = (i * 2 * Math.PI) / 6;
        pts.push({ x: Math.cos(a), y: Math.sin(a) });
      }
      for (let i = 0; i <= 6; i++) {
        const a = (i * 2 * Math.PI) / 6 + Math.PI / 6;
        pts.push({ x: 0.45 * Math.cos(a), y: 0.45 * Math.sin(a) });
      }
      return pts;
    }
  }
};

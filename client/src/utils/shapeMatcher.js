/**
 * True Resemblance Geometric Evaluator for Gesture Survival.
 * Computes bidirectional Chamfer & Hausdorff Point-to-Segment Contour Distance
 * between the user's normalized air-drawn path and the exact mathematical template
 * of the target shape.
 *
 * If a user draws a wrong shape (e.g. Circle instead of Star), this will strictly
 * detect the discrepancy and drop the accuracy accordingly.
 */

// 1. Exact Mathematical Segment Contours for all 9 shapes (Normalized to [-1, 1] range)
export const SHAPE_SEGMENTS = {
  // 1: Rhombus (4 segments)
  1: [
    { a: [0, -1], b: [0.85, 0] },
    { a: [0.85, 0], b: [0, 1] },
    { a: [0, 1], b: [-0.85, 0] },
    { a: [-0.85, 0], b: [0, -1] }
  ],

  // 2: 5-Pointed Star (10 segments)
  2: (() => {
    const segs = [];
    for (let i = 0; i < 10; i++) {
      const a1 = (i * Math.PI) / 5 - Math.PI / 2;
      const a2 = ((i + 1) * Math.PI) / 5 - Math.PI / 2;
      const r1 = i % 2 === 0 ? 1.0 : 0.42;
      const r2 = (i + 1) % 2 === 0 ? 1.0 : 0.42;
      segs.push({
        a: [r1 * Math.cos(a1), r1 * Math.sin(a1)],
        b: [r2 * Math.cos(a2), r2 * Math.sin(a2)]
      });
    }
    return segs;
  })(),

  // 3: Triangular Prism (9 segments)
  3: [
    // Front triangle
    { a: [0, -0.75], b: [0.65, 0.5] },
    { a: [0.65, 0.5], b: [-0.65, 0.5] },
    { a: [-0.65, 0.5], b: [0, -0.75] },
    // Back triangle (offset)
    { a: [0.35, -1.0], b: [1.0, 0.25] },
    { a: [1.0, 0.25], b: [-0.3, 0.25] },
    { a: [-0.3, 0.25], b: [0.35, -1.0] },
    // Connecting edges
    { a: [0, -0.75], b: [0.35, -1.0] },
    { a: [0.65, 0.5], b: [1.0, 0.25] },
    { a: [-0.65, 0.5], b: [-0.3, 0.25] }
  ],

  // 4: Pentagonal Pyramid (10 segments: 5 base + 5 apex edges)
  4: (() => {
    const segs = [];
    const apex = [0, -0.9];
    const basePts = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 + Math.PI / 10;
      basePts.push([0.75 * Math.cos(angle), 0.35 + 0.35 * Math.sin(angle)]);
    }
    for (let i = 0; i < 5; i++) {
      segs.push({ a: basePts[i], b: basePts[(i + 1) % 5] });
      segs.push({ a: basePts[i], b: apex });
    }
    return segs;
  })(),

  // 5: Umbrella (Dome arc + Rim scallops + Handle)
  5: (() => {
    const segs = [];
    const domeSamples = 12;
    for (let i = 0; i < domeSamples; i++) {
      const a1 = Math.PI - (i * Math.PI) / domeSamples;
      const a2 = Math.PI - ((i + 1) * Math.PI) / domeSamples;
      segs.push({
        a: [0.85 * Math.cos(a1), -0.2 - 0.85 * Math.sin(a1)],
        b: [0.85 * Math.cos(a2), -0.2 - 0.85 * Math.sin(a2)]
      });
    }
    segs.push({ a: [-0.85, -0.2], b: [-0.28, -0.15] });
    segs.push({ a: [-0.28, -0.15], b: [0.28, -0.15] });
    segs.push({ a: [0.28, -0.15], b: [0.85, -0.2] });
    segs.push({ a: [0, -0.2], b: [0, 0.65] });
    segs.push({ a: [0, 0.65], b: [-0.2, 0.75] });
    segs.push({ a: [-0.2, 0.75], b: [-0.35, 0.6] });
    segs.push({ a: [0, -1.05], b: [0, -0.85] });
    return segs;
  })(),

  // 6: Butterfly (Body + 4 wing lobes + antennae)
  6: (() => {
    const segs = [];
    segs.push({ a: [0, -0.5], b: [0, 0.5] });
    segs.push({ a: [0, -0.45], b: [-0.25, -0.75] });
    segs.push({ a: [0, -0.45], b: [0.25, -0.75] });
    segs.push({ a: [0, -0.2], b: [-0.5, -0.7] });
    segs.push({ a: [-0.5, -0.7], b: [-0.9, -0.3] });
    segs.push({ a: [-0.9, -0.3], b: [0, 0] });
    segs.push({ a: [0, -0.2], b: [0.5, -0.7] });
    segs.push({ a: [0.5, -0.7], b: [0.9, -0.3] });
    segs.push({ a: [0.9, -0.3], b: [0, 0] });
    segs.push({ a: [0, 0], b: [-0.7, 0.4] });
    segs.push({ a: [-0.7, 0.4], b: [-0.3, 0.7] });
    segs.push({ a: [-0.3, 0.7], b: [0, 0.4] });
    segs.push({ a: [0, 0], b: [0.7, 0.4] });
    segs.push({ a: [0.7, 0.4], b: [0.3, 0.7] });
    segs.push({ a: [0.3, 0.7], b: [0, 0.4] });
    return segs;
  })(),

  // 7: Octagram (8-pointed dual rotated squares: 8 segments)
  7: [
    { a: [-0.75, -0.75], b: [0.75, -0.75] },
    { a: [0.75, -0.75], b: [0.75, 0.75] },
    { a: [0.75, 0.75], b: [-0.75, 0.75] },
    { a: [-0.75, 0.75], b: [-0.75, -0.75] },
    { a: [0, -1.06], b: [1.06, 0] },
    { a: [1.06, 0], b: [0, 1.06] },
    { a: [0, 1.06], b: [-1.06, 0] },
    { a: [-1.06, 0], b: [0, -1.06] }
  ],

  // 8: Nonagon (9 segments)
  8: (() => {
    const segs = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a1 = (i * 2 * Math.PI) / n - Math.PI / 2;
      const a2 = ((i + 1) * 2 * Math.PI) / n - Math.PI / 2;
      segs.push({
        a: [0.95 * Math.cos(a1), 0.95 * Math.sin(a1)],
        b: [0.95 * Math.cos(a2), 0.95 * Math.sin(a2)]
      });
    }
    return segs;
  })(),

  // 9: Icosahedron (24 segments)
  9: (() => {
    const segs = [];
    const outer = [];
    const inner = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * 2 * Math.PI) / 6;
      outer.push([Math.cos(a), Math.sin(a)]);
      const aInner = a + Math.PI / 6;
      inner.push([0.45 * Math.cos(aInner), 0.45 * Math.sin(aInner)]);
    }
    for (let i = 0; i < 6; i++) {
      segs.push({ a: outer[i], b: outer[(i + 1) % 6] });
      segs.push({ a: inner[i], b: inner[(i + 1) % 6] });
      segs.push({ a: outer[i], b: inner[i] });
      segs.push({ a: outer[(i + 1) % 6], b: inner[i] });
    }
    return segs;
  })()
};

// Pre-compute dense sample points along the reference segments
const TEMPLATE_SAMPLES = {};
Object.entries(SHAPE_SEGMENTS).forEach(([lvl, segs]) => {
  const samples = [];
  const samplesPerSeg = Math.max(3, Math.floor(60 / segs.length));
  segs.forEach(seg => {
    const [ax, ay] = seg.a;
    const [bx, by] = seg.b;
    for (let k = 0; k <= samplesPerSeg; k++) {
      const t = k / samplesPerSeg;
      samples.push([ax + t * (bx - ax), ay + t * (by - ay)]);
    }
  });
  TEMPLATE_SAMPLES[lvl] = samples;
});

// Distance from point P(px, py) to line segment AB
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.hypot(px - projX, py - projY);
}

// Minimum distance from query point to closest segment in template
function minDistToShape(px, py, segments) {
  let minD = Infinity;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const d = distToSegment(px, py, seg.a[0], seg.a[1], seg.b[0], seg.b[1]);
    if (d < minD) {
      minD = d;
      if (minD < 0.02) break;
    }
  }
  return minD;
}

// Resample a raw polyline into N equidistant points along arc length
function resamplePath(path, n = 64) {
  if (path.length < 2) return path;

  let totalLen = 0;
  const cumLens = [0];
  for (let i = 1; i < path.length; i++) {
    totalLen += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    cumLens.push(totalLen);
  }

  if (totalLen === 0) return path;

  const resampled = [{ x: path[0].x, y: path[0].y }];
  const interval = totalLen / (n - 1);
  let curIdx = 1;

  for (let i = 1; i < n - 1; i++) {
    const targetDist = i * interval;
    while (curIdx < cumLens.length && cumLens[curIdx] < targetDist) {
      curIdx++;
    }
    if (curIdx >= cumLens.length) {
      resampled.push({ x: path[path.length - 1].x, y: path[path.length - 1].y });
      continue;
    }

    const prevDist = cumLens[curIdx - 1];
    const nextDist = cumLens[curIdx];
    const segLen = nextDist - prevDist;
    const t = segLen > 0 ? (targetDist - prevDist) / segLen : 0;

    const p0 = path[curIdx - 1];
    const p1 = path[curIdx];
    resampled.push({
      x: p0.x + t * (p1.x - p0.x),
      y: p0.y + t * (p1.y - p0.y)
    });
  }

  resampled.push({ x: path[path.length - 1].x, y: path[path.length - 1].y });
  return resampled;
}

/**
 * Main Evaluation Function:
 * @param {Array<{x: number, y: number}>} rawPath - User's air-drawn path
 * @param {number} shapeLevel - 1 to 9
 * @returns {number} True geometric accuracy percentage (0 - 98)
 */
export function evaluateDrawing(rawPath, shapeLevel) {
  const segments = SHAPE_SEGMENTS[shapeLevel] || SHAPE_SEGMENTS[1];
  const templatePoints = TEMPLATE_SAMPLES[shapeLevel] || TEMPLATE_SAMPLES[1];

  if (!rawPath || rawPath.length < 4) {
    return 0;
  }

  // If path is sparse (e.g. user clicked a few sharp vertices), interpolate densely between them
  let densePath = rawPath;
  if (rawPath.length < 35) {
    densePath = [];
    for (let i = 0; i < rawPath.length - 1; i++) {
      const p1 = rawPath[i];
      const p2 = rawPath[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const steps = Math.max(2, Math.floor(dist / 8));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        densePath.push({
          x: p1.x + t * (p2.x - p1.x),
          y: p1.y + t * (p2.y - p1.y)
        });
      }
    }
    densePath.push(rawPath[rawPath.length - 1]);
  }

  // 1. Calculate Bounding Box of user's path
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let i = 0; i < densePath.length; i++) {
    const pt = densePath[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const area = width * height;

  // Reject tiny drawings or single clicks
  if (area < 2500 || width < 40 || height < 40) {
    return Math.min(10, Math.round((area / 2500) * 10));
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = Math.max(width, height) / 2; // Normalizes stroke to [-1, 1]

  // 2. Uniformly resample user stroke (64 points)
  const resampled = resamplePath(densePath, 64);

  // 3. Normalize user points to centered coordinate frame [-1, 1]
  const normalizedUser = resampled.map(pt => ({
    x: (pt.x - cx) / scale,
    y: (pt.y - cy) / scale
  }));

  // 4. Measure Shape Adherence (Precision):
  // How close is EVERY user-drawn point to the actual shape outline?
  let totalAdherenceDist = 0;
  let maxAdherenceDist = 0;
  for (let i = 0; i < normalizedUser.length; i++) {
    const u = normalizedUser[i];
    const d = minDistToShape(u.x, u.y, segments);
    totalAdherenceDist += d;
    if (d > maxAdherenceDist) maxAdherenceDist = d;
  }
  const avgAdherenceError = totalAdherenceDist / normalizedUser.length;

  // 5. Measure Shape Completeness (Recall / Coverage):
  // Did the user trace the WHOLE shape, or are critical sections missing?
  let totalCoverageDist = 0;
  let maxCoverageDist = 0;
  for (let j = 0; j < templatePoints.length; j++) {
    const [tx, ty] = templatePoints[j];
    let minDToUser = Infinity;
    for (let i = 0; i < normalizedUser.length; i++) {
      const u = normalizedUser[i];
      const d = Math.hypot(tx - u.x, ty - u.y);
      if (d < minDToUser) {
        minDToUser = d;
        if (minDToUser < 0.03) break;
      }
    }
    totalCoverageDist += minDToUser;
    if (minDToUser > maxCoverageDist) maxCoverageDist = minDToUser;
  }
  const avgCoverageError = totalCoverageDist / templatePoints.length;

  // 6. Hausdorff Maximum Deviation Factor
  const maxDeviation = Math.max(maxAdherenceDist, maxCoverageDist);

  // 7. Composite Resemblance Error
  // - Adherence (55%): Points must be on shape contours
  // - Coverage (35%): Shape must be fully traced
  // - Max Deviation (10%): Extremities must match
  const compositeError = (
    0.55 * avgAdherenceError +
    0.35 * avgCoverageError +
    0.10 * Math.min(1.0, maxDeviation * 0.7)
  );

  // 8. Strict Resemblance Mapping:
  // - Composite error <= 0.08: 90% - 98% (Virtually exact trace)
  // - Composite error ~ 0.14: 76% - 86% (Accurate trace with hand jitter)
  // - Composite error ~ 0.22: 45% - 60% (Moderate resemblance)
  // - Composite error >= 0.32: 0% - 25% (Wrong shape detected!)
  const errorCutoff = 0.32;
  const normalizedError = Math.max(0, Math.min(1, compositeError / errorCutoff));

  // Non-linear power curve that sharply penalizes wrong shapes
  const accuracyFraction = Math.max(0, 1 - Math.pow(normalizedError, 1.4));
  let accuracy = Math.round(accuracyFraction * 98);

  // 9. Stroke Continuity & Length Verification
  let totalDrawnLength = 0;
  for (let i = 1; i < densePath.length; i++) {
    totalDrawnLength += Math.hypot(densePath[i].x - densePath[i - 1].x, densePath[i].y - densePath[i - 1].y);
  }
  const minExpectedPerimeter = scale * 2.8;
  if (totalDrawnLength < minExpectedPerimeter) {
    const completionFactor = Math.min(1.0, totalDrawnLength / minExpectedPerimeter);
    accuracy = Math.round(accuracy * Math.pow(completionFactor, 1.3));
  }

  return Math.max(0, Math.min(98, accuracy));
}

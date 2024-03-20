import {
  Manager,
  Renderer2D,
  Vector2,
  Renderer2DPlugin,
  vertices,
  clamp,
  radToDeg
} from './lib/chaos.module.js';
import { random,bull } from "./shapes.js"

export const game = new Manager()
export const viewport = new Renderer2D()

Renderer2D.bindTo(viewport, "#canvas-container")
Renderer2D.setViewport(viewport, innerWidth, innerHeight)
game.registerPlugin(new Renderer2DPlugin(viewport))


const points = bull
const triangles = triangulate(points.map(v => Vector2.copy(v)))

game.registerSystem(manager => {
  const ctx = manager.getResource("ctx")

  drawFullShape(ctx)
  drawTriangles(ctx)

})

function drawTriangles(ctx) {
  ctx.beginPath()
  for (let i = 0; i < triangles.length; i++) {
    vertices(ctx, triangles[i], true)
  }
  ctx.lineWidth = 2
  ctx.strokeStyle = "blue"
  ctx.stroke()
  ctx.closePath()
}

function drawFullShape(ctx) {
  ctx.beginPath()
  vertices(ctx, points, true)
  ctx.fillStyle = "white"
  ctx.fill()
  ctx.closePath()
}

function calcAngle(a, b, c) {
  const l1 = Vector2.sub(a, b)
  const l2 = Vector2.sub(c, b)

  return Vector2.getAbsAngleBetween(l1, l2)
}

function triangulate(points) {
  const triangles = []

  for (let i = 0; i < points.length; i++) {
    if (points.length == 2) break
    let j = i == 0 ? points.length - 1 : i - 1
    const p1 = points[j]
    const p2 = points[i]
    const p3 = points[clamp(i + 1, 0, points.length - 1)]
    const a2 = calcAngle(p3, p2, p1)
    const triangle = [p3, p2, p1]
    if (a2 > Math.PI) continue
    if (triangleContains(triangle, points,i + 2)) continue
    points.splice(i, 1)
    i = -1
    triangles.push(triangle)
  }
  return triangles
}

function triangleContains(triangle, vertices,start) {
  for (let i = start; i < vertices.length; i++) {
    if (compare(vertices[i], ...triangle))
      return true
  }
  return false
}

function compare(p, p0, p1, p2) {
  let x = p.x
  let y = p.y
  let det = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x)

  return det * ((p1.x - p0.x) * (y - p0.y) - (p1.y - p0.y) * (x - p0.x)) >= 0 &&
    det * ((p2.x - p1.x) * (y - p1.y) - (p2.y - p1.y) * (x - p1.x)) >= 0 &&
    det * ((p0.x - p2.x) * (y - p2.y) - (p0.y - p2.y) * (x - p2.x)) >= 0
}
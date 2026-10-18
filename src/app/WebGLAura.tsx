import { useEffect, useRef } from "react"

/** Lightweight decorative WebGL shader. No tracking, libraries, or user data. */
export function WebGLAura({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" })
    if (!gl) return
    const vertex = `attribute vec2 a_position; varying vec2 v_uv; void main(){ v_uv = a_position*.5+.5; gl_Position = vec4(a_position, 0.0, 1.0); }`
    const fragment = `precision mediump float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    float blob(vec2 uv,vec2 p,float r){ vec2 q=(uv-p)/r; return exp(-4.2*dot(q,q)); }
    void main(){
      vec2 uv = v_uv;
      vec2 a = vec2(.48+.13*sin(u_time*.36), .58+.09*cos(u_time*.33));
      vec2 b = vec2(.68+.1*cos(u_time*.29), .37+.11*sin(u_time*.28));
      vec2 c = vec2(.24+.06*sin(u_time*.42), .28+.06*cos(u_time*.38));
      float g = blob(uv,a,.6) + blob(uv,b,.48) + blob(uv,c,.43);
      float wave = sin(uv.y*7.0 + sin(uv.x*4.0+u_time*.3)*1.7 - u_time*.38)*.055;
      float hi = blob(uv, u_mouse, .35)*.16;
      vec3 deep = vec3(.14,.065,.26);
      vec3 violet = vec3(.43,.24,.69);
      vec3 lilac = vec3(.72,.62,.94);
      vec3 lime = vec3(.78,.98,.36);
      vec3 col = mix(deep,violet,clamp(g*.85+wave,0.0,1.0));
      col = mix(col,lilac,clamp(g-.45,0.0,.55));
      col = mix(col,lime,clamp((blob(uv,vec2(.73,.77),.34)+hi-.42)*.42,0.0,.3));
      gl_FragColor = vec4(col,1.0);
    }`
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null }
      return shader
    }
    const vs = compile(gl.VERTEX_SHADER, vertex)
    const fs = compile(gl.FRAGMENT_SHADER, fragment)
    if (!vs || !fs) { if (vs) gl.deleteShader(vs); if (fs) gl.deleteShader(fs); return }
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return }
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const timeUniform = gl.getUniformLocation(program, "u_time")
    const resUniform = gl.getUniformLocation(program, "u_resolution")
    const mouseUniform = gl.getUniformLocation(program, "u_mouse")
    const mouse = { x: .73, y: .77 }
    let visible = true, frame = 0, lastTime = 0
    const updateMouse = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = Math.max(0,Math.min(1,(event.clientX - rect.left)/rect.width))
      mouse.y = 1-Math.max(0,Math.min(1,(event.clientY - rect.top)/rect.height))
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1,Math.round(rect.width*dpr))
      canvas.height = Math.max(1,Math.round(rect.height*dpr))
      gl.viewport(0,0,canvas.width,canvas.height)
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: .01 })
    observer.observe(canvas)
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(canvas)
    canvas.addEventListener("pointermove", updateMouse)
    resize()
    function render(now: number) {
      frame = requestAnimationFrame(render)
      if (!visible || document.hidden || now-lastTime < 33) return
      lastTime = now
      gl!.useProgram(program)
      gl!.uniform1f(timeUniform, now*.001)
      gl!.uniform2f(resUniform, canvas!.width, canvas!.height)
      gl!.uniform2f(mouseUniform, mouse.x, mouse.y)
      gl!.drawArrays(gl!.TRIANGLES, 0, 6)
    }
    frame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      sizeObserver.disconnect()
      canvas.removeEventListener("pointermove", updateMouse)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])
  return <canvas className={`webgl-aura ${className}`} ref={canvasRef} aria-hidden="true" />
}

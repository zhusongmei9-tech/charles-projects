import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 端口优先级：PORT 环境变量 > 默认 5000。
// macOS 的隔空投送接收器（ControlCenter）会占用 5000，读 PORT 便于外部运行器指定端口。
const port = Number(process.env.PORT) || 5000;

export default defineConfig({
  base: "/apps/",
  plugins: [react()],
  server: {
    port,
    strictPort: true,
  },
});

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// import type { Options } from "sass"

export default defineConfig({
	plugins: [sveltekit()],

	css: {
        preprocessorOptions: {
            scss: {
                additionalData: "@use \"./src/variables.scss\" as *;\n",
				api: 'modern',
				loadPaths: [
					"."
				],
            }
            // satisfies Options<"async"> & { api: string; additionalData: string }
        }
    },
});

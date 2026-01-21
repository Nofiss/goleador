import { defineConfig } from "orval";

export default defineConfig({
	goleador: {
		input: "https://localhost:7063/swagger/v1/swagger.json",
		output: {
			mode: "tags-split",
			target: "src/api/generated/goleador.ts",
			client: "react-query",
			override: {
				mutator: {
					path: "./src/api/axios.ts",
					name: "customInstance",
				},
			},
		},
	},
});

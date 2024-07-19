export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

export function path2array(path: string) {
	return path.split("/").filter(Boolean)
}

export function normalizePath(path: string) {
	return path2array(path).join("/")
}
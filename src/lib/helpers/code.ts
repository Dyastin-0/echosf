export const generatecode = (f: number, s: number, t: number): string => {
	const charset: string = 'abcdefghijklmnopqrstuvwxyz0123456789';

	function randomString(length: number): string {
		let result: string = '';
		for (let i = 0; i < length; i++) {
			result += charset.charAt(Math.floor(Math.random() * charset.length));
		}
		return result;
	}

	return `${randomString(f)}-${randomString(s)}-${randomString(t)}`;
};

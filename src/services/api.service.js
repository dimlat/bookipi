export const buildMessage = () => {
    const name = process.env.NAME || 'Backend';
    return `Hello from ${name}`;
};
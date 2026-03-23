import { buildMessage } from '../services/api.service.js';

export const getMessage = (req, res) => {
    const message = buildMessage();
    res.json({ message });
};
import React, { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const EditLabelItemModal = ({ open, onClose, item, onSave }) => {
    const [formData, setFormData] = useState({ ...item });

    useEffect(() => {
        // Update form data when the item prop changes
        setFormData({ ...item });
    }, [item]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    if (!item) return null;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Label Properties for {item.name}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    name="default_expiration_days"
                    label="Default Expiration (Days)"
                    type="number"
                    fullWidth
                    variant="standard"
                    value={formData.default_expiration_days || ''}
                    onChange={handleChange}
                />
                <FormControl fullWidth margin="dense" variant="standard">
                    <InputLabel id="status-select-label">Default Status</InputLabel>
                    <Select
                        labelId="status-select-label"
                        name="default_label_status"
                        value={formData.default_label_status || ''}
                        onChange={handleChange}
                        label="Default Status"
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="RESFRIADO">RESFRIADO</MenuItem>
                        <MenuItem value="CONGELADO">CONGELADO</MenuItem>
                        <MenuItem value="AMBIENTE">AMBIENTE</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditLabelItemModal;

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import SpinTheWheel from '@/components/UI/SpinTheWheel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const RewardFormDialog = ({ open, onClose, onSubmit, isEditing, control, errors, watch }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'wheel_config.items',
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Recompensa' : 'Nova Recompensa'}</DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field }) => (
                  <TextField {...field} label="Nome" fullWidth error={!!errors.title} helperText={errors.title?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="reward_type"
                control={control}
                rules={{ required: 'Tipo é obrigatório' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.reward_type}>
                    <InputLabel>Tipo</InputLabel>
                    <Select {...field} label="Tipo">
                      <SelectMenuItem value="discount_percentage">Desconto (%)</SelectMenuItem>
                      <SelectMenuItem value="discount_fixed">Desconto Fixo</SelectMenuItem>
                      <SelectMenuItem value="free_item">Item Grátis</SelectMenuItem>
                      <SelectMenuItem value="points_multiplier">Multiplicador de Pontos</SelectMenuItem>
                      <SelectMenuItem value="cashback">Cashback</SelectMenuItem>
                      <SelectMenuItem value="spin_the_wheel">Roleta de Prêmios</SelectMenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            {watch('reward_type') === 'spin_the_wheel' && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Configuração da Roleta
                </Typography>
                <SpinTheWheel items={watch('wheel_config.items')} />
                {fields.map((item, index) => (
                  <Paper key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`wheel_config.items.${index}.title`}
                          control={control}
                          rules={{ required: 'Título do item é obrigatório' }}
                          render={({ field }) => (
                            <TextField {...field} label="Título do Item" fullWidth />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`wheel_config.items.${index}.probability`}
                          control={control}
                          rules={{ required: 'Probabilidade é obrigatória', min: 0 }}
                          render={({ field }) => (
                            <TextField {...field} label="Probabilidade" type="number" fullWidth />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button variant="outlined" color="error" onClick={() => remove(index)} startIcon={<DeleteIcon />}>
                          Remover
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => append({ title: '', probability: 0 })}>
                  Adicionar Item à Roleta
                </Button>
              </Grid>
            )}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Descrição" multiline rows={3} fullWidth />
                )}
              />
            </Grid>
            {watch('reward_type') !== 'spin_the_wheel' && (
              <>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="value"
                    control={control}
                    rules={{ required: 'Valor é obrigatório' }}
                    render={({ field }) => (
                      <TextField {...field} label="Valor (%)" type="number" fullWidth error={!!errors.value} helperText={errors.value?.message} />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="points_required"
                    control={control}
                    rules={{ required: 'Pontos são obrigatórios' }}
                    render={({ field }) => (
                      <TextField {...field} label="Pontos Necessários" type="number" fullWidth error={!!errors.points_required} helperText={errors.points_required?.message} />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="max_uses"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Usos Máximos" type="number" fullWidth helperText="Deixe em branco para ilimitado" />
                    )}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={6}>
              <Controller
                name="expires_at"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Data de Expiração da Recompensa" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} helperText="Quando a recompensa não poderá mais ser ganha." />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="coupon_validity_days"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Dias de Validade do Cupom" type="number" fullWidth helperText="Por quantos dias o cupom será válido após ser gerado." InputProps={{ inputProps: { min: 1 } }} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <SelectMenuItem value="active">Ativo</SelectMenuItem>
                      <SelectMenuItem value="inactive">Inativo</SelectMenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained">
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RewardFormDialog;

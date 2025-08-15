import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import ManageLabelItems from '../../components/Labels/ManageLabelItems';
import PrintHistory from '../../components/Labels/PrintHistory';
import LossHistory from '../../components/Labels/LossHistory';

// Placeholder components for each tab panel
// const ManageLabelItems = () => <div>Gerenciar Produtos e Insumos (Conteúdo)</div>;
const LossHistory = () => <div>Histórico de Perdas (Conteúdo)</div>;
// const PrintHistory = () => <div>Histórico de Impressão (Conteúdo)</div>;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LabelsAdmin = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="Labels admin tabs">
                    <Tab label="Itens para Etiqueta" />
                    <Tab label="Histórico de Perdas" />
                    <Tab label="Histórico de Impressão" />
                </Tabs>
            </Box>
            <TabPanel value={currentTab} index={0}>
                <ManageLabelItems />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
                <LossHistory />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
                <PrintHistory />
            </TabPanel>
        </Box>
    );
};

export default LabelsAdmin;

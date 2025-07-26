import React from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import {
  Receipt as InvoiceIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  CheckCircle as PaidIcon,
  Pending as PendingIcon,
  Warning as OverdueIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        borderLeft: `4px solid ${theme.palette[color].main}`,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" variant="subtitle2">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: theme.palette[color].light,
            color: theme.palette[color].main,
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon fontSize="large" />
        </Box>
      </Box>
    </Paper>
  );
};\n
const Dashboard = () => {
  const theme = useTheme();

  // Mock data - in a real app, this would come from an API
  const stats = [
    { title: 'Total Invoices', value: '24', icon: InvoiceIcon, color: 'primary' },
    { title: 'Total Revenue', value: '$12,450', icon: MoneyIcon, color: 'success' },
    { title: 'Active Clients', value: '18', icon: PeopleIcon, color: 'secondary' },
    { title: 'Outstanding', value: '$3,250', icon: PendingIcon, color: 'warning' },
  ];

  const recentInvoices = [
    { id: 'INV-001', client: 'Acme Corp', date: '2023-05-15', amount: 1250, status: 'paid' },
    { id: 'INV-002', client: 'Globex', date: '2023-05-10', amount: 3250, status: 'pending' },
    { id: 'INV-003', client: 'Soylent', date: '2023-05-05', amount: 875, status: 'overdue' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'overdue':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <PaidIcon sx={{ color: getStatusColor(status), mr: 1 }} />;
      case 'pending':
        return <PendingIcon sx={{ color: getStatusColor(status), mr: 1 }} />;
      case 'overdue':
        return <OverdueIcon sx={{ color: getStatusColor(status), mr: 1 }} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Recent Invoices */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Invoices
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            View All
          </Typography>
        </Box>
        
        <Box>
          {recentInvoices.map((invoice) => (
            <Box
              key={invoice.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                mb: 1,
                borderRadius: 1,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {invoice.id}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {invoice.client}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  {getStatusIcon(invoice.status)}
                  <Typography
                    variant="body2"
                    sx={{
                      textTransform: 'capitalize',
                      color: getStatusColor(invoice.status),
                    }}
                  >
                    {invoice.status}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {new Date(invoice.date).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, minWidth: 100, textAlign: 'right' }}>
                ${invoice.amount.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ReceiptIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2">Create Invoice</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2">Add Client</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Recent Activity
            </Typography>
            <Box>
              {[1, 2, 3].map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <ReceiptIcon color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      <strong>Invoice #{1000 + item}</strong> was created
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item} hour{item !== 1 ? 's' : ''} ago
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

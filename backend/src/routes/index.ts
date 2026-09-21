import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

import * as authController from '../controllers/authController';
import * as importController from '../controllers/importController';
import * as leadsController from '../controllers/leadsController';
import * as outreachController from '../controllers/outreachController';
import * as templateController from '../controllers/templateController';
import * as followUpController from '../controllers/followUpController';
import * as dashboardController from '../controllers/dashboardController';
import * as settingsController from '../controllers/settingsController';
import * as exportController from '../controllers/exportController';

const router = Router();

// Auth Routes
router.post('/auth/login', authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);

// Import Routes
router.post('/imports/upload', authMiddleware, upload.single('file'), importController.uploadAndPreview);
router.post('/imports/process', authMiddleware, importController.processImport);
router.get('/imports/history', authMiddleware, importController.getImportHistory);

// Leads Routes
router.get('/leads', authMiddleware, leadsController.getLeads);
router.get('/leads/:id', authMiddleware, leadsController.getLeadById);
router.post('/leads', authMiddleware, leadsController.createLead);
router.put('/leads/:id', authMiddleware, leadsController.updateLead);
router.delete('/leads/:id', authMiddleware, leadsController.deleteLead);
router.post('/leads/bulk-status', authMiddleware, leadsController.bulkUpdateStatus);
router.post('/leads/bulk-delete', authMiddleware, leadsController.bulkDeleteLeads);

// Outreach Mode Routes
router.get('/outreach/session', authMiddleware, outreachController.getOutreachSession);
router.post('/outreach/open-whatsapp', authMiddleware, outreachController.openWhatsApp);
router.post('/outreach/mark-contacted', authMiddleware, outreachController.markContacted);
router.post('/outreach/next', authMiddleware, outreachController.nextLead);

// Message Templates Routes
router.get('/templates', authMiddleware, templateController.getTemplates);
router.post('/templates', authMiddleware, templateController.createTemplate);
router.put('/templates/:id', authMiddleware, templateController.updateTemplate);
router.delete('/templates/:id', authMiddleware, templateController.deleteTemplate);

// Follow-Ups Routes
router.post('/follow-ups', authMiddleware, followUpController.createFollowUp);
router.get('/follow-ups/today', authMiddleware, followUpController.getTodayFollowUps);
router.put('/follow-ups/:id/status', authMiddleware, followUpController.updateFollowUpStatus);

// Dashboard Analytics Routes
router.get('/dashboard/stats', authMiddleware, dashboardController.getDashboardStats);

// Settings Routes
router.get('/settings', authMiddleware, settingsController.getSettings);
router.put('/settings', authMiddleware, settingsController.updateSettings);

// Export Routes
router.get('/exports/csv', authMiddleware, exportController.exportCSV);
router.get('/exports/excel', authMiddleware, exportController.exportExcel);
router.get('/exports/pdf', authMiddleware, exportController.exportPDF);

export default router;

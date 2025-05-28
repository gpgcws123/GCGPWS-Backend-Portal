const Admission = require('../models/Admission');
const Notification = require('../models/Notification');
const emailService = require('../utlies/emailService');
const fs = require('fs');
const path = require('path');

// Submit new admission application
exports.submitAdmission = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dob,
            address,
            city,
            state,
            zipCode,
            course,
            admissionYear,
            matricSchool,
            matricBoard,
            matricPassingYear,
            matricPercentage,
            interCollege,
            interBoard,
            interPassingYear,
            interPercentage,
            photoUrl,
            matricMarksheetUrl,
            interMarksheetUrl,
            idProofUrl
        } = req.body;

        const newAdmission = new Admission({
            firstName,
            lastName,
            email,
            phone,
            dob: new Date(dob),
            address,
            city,
            state,
            zipCode,
            course,
            admissionYear,
            matricSchool,
            matricBoard,
            matricPassingYear,
            matricPercentage,
            interCollege,
            interBoard,
            interPassingYear,
            interPercentage,
            photoUrl,
            matricMarksheetUrl,
            interMarksheetUrl,
            idProofUrl
        });

        const savedAdmission = await newAdmission.save();

        // Create notification for admin panel
        await new Notification({
            type: 'admission',
            message: `New admission application received from ${firstName} ${lastName}`,
            relatedTo: savedAdmission._id
        }).save();

        // Send acknowledgment email to applicant
        await emailService.sendAcknowledgmentEmail(email, {
            firstName,
            lastName,
            course,
            applicationId: savedAdmission._id
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully. Please check your email for confirmation.',
            applicationId: savedAdmission._id
        });
    } catch (error) {
        console.error('Error submitting admission application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    }
};

// Get all admissions (for admin panel)
exports.getAllAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find()
            .sort({ createdAt: -1 });

        res.status(200).json(admissions);
    } catch (error) {
        console.error('Error fetching admissions:', error);
        res.status(500).json([]);
    }
};

// Get a single admission by ID
exports.getAdmissionById = async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id);

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'Admission application not found'
            });
        }

        res.status(200).json({
            success: true,
            data: admission
        });
    } catch (error) {
        console.error('Error fetching admission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admission',
            error: error.message
        });
    }
};

// Update admission status (approve/reject)
exports.updateAdmissionStatus = async (req, res) => {
    try {
        const { status, message } = req.body;
        const { id } = req.params;

        console.log('Starting status update process:', { status, message, id });

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            console.log('Invalid status value:', status);
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const admission = await Admission.findById(id);

        if (!admission) {
            console.log('Admission not found for ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Admission application not found'
            });
        }

        console.log('Found admission:', admission);

        // Update the admission status
        admission.status = status;
        admission.statusMessage = message;
        admission.updatedAt = new Date();

        const updatedAdmission = await admission.save();
        console.log('Admission updated successfully:', updatedAdmission);

        // Create notification about the status change
        await new Notification({
            type: 'admission',
            message: `Admission application ${status} for ${admission.firstName} ${admission.lastName}`,
            relatedTo: admission._id
        }).save();
        console.log('Notification created');

        // Send email notification to the applicant
        console.log('Preparing to send email notification');
        try {
            if (status === 'approved') {
                console.log('Sending approval email to:', admission.email);
                await emailService.sendApprovalEmail(admission.email, {
                    firstName: admission.firstName,
                    lastName: admission.lastName,
                    course: admission.course
                });
                console.log('Approval email sent successfully');
            } else if (status === 'rejected') {
                console.log('Sending rejection email to:', admission.email);
                await emailService.sendRejectionEmail(admission.email, {
                    firstName: admission.firstName,
                    lastName: admission.lastName,
                    course: admission.course,
                    reason: message
                });
                console.log('Rejection email sent successfully');
            }
        } catch (emailError) {
            console.error('Error in email service:', emailError);
            // Don't throw the error, but log it
        }

        res.status(200).json({
            success: true,
            message: `Admission status updated to ${status}`,
            data: updatedAdmission
        });
    } catch (error) {
        console.error('Error updating admission status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update admission status',
            error: error.message
        });
    }
};

// Get admission statistics for admin dashboard
exports.getAdmissionStats = async (req, res) => {
    try {
        const totalAdmissions = await Admission.countDocuments();
        const pendingAdmissions = await Admission.countDocuments({ status: 'pending' });
        const approvedAdmissions = await Admission.countDocuments({ status: 'approved' });
        const rejectedAdmissions = await Admission.countDocuments({ status: 'rejected' });

        // Get recent admissions, sorted by creation date
        const recentAdmissions = await Admission.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName course status createdAt');

        res.status(200).json({
            success: true,
            data: {
                total: totalAdmissions,
                pending: pendingAdmissions,
                approved: approvedAdmissions,
                rejected: rejectedAdmissions,
                recent: recentAdmissions
            }
        });
    } catch (error) {
        console.error('Error fetching admission stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admission statistics',
            error: error.message
        });
    }
};

// Get admission content by type
exports.getAdmissionContent = async (req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { type } : {};
        const content = await Admission.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: content });
    } catch (error) {
        console.error('Error fetching admission content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create admission content
exports.createAdmissionContent = async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ success: false, error: req.fileValidationError });
        }

        const { title, description, content, type, startDate, endDate, seats, duration } = req.body;
        
        const newContent = new Admission({
            title,
            description,
            content,
            type,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            seats,
            duration,
            image: req.file ? `/uploads/admissions/${req.file.filename}` : undefined
        });

        const savedContent = await newContent.save();
        res.status(201).json({ success: true, data: savedContent });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Error creating admission content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update admission content
exports.updateAdmissionContent = async (req, res) => {
    try {
        if (req.fileValidationError) {
            return res.status(400).json({ success: false, error: req.fileValidationError });
        }

        const { title, description, content, type, startDate, endDate, seats, duration } = req.body;
        const contentToUpdate = await Admission.findById(req.params.id);

        if (!contentToUpdate) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        // Delete old image if new one is uploaded
        if (req.file && contentToUpdate.image) {
            const oldImagePath = path.join(__dirname, '..', contentToUpdate.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        contentToUpdate.title = title;
        contentToUpdate.description = description;
        contentToUpdate.content = content;
        contentToUpdate.type = type;
        contentToUpdate.startDate = startDate ? new Date(startDate) : undefined;
        contentToUpdate.endDate = endDate ? new Date(endDate) : undefined;
        contentToUpdate.seats = seats;
        contentToUpdate.duration = duration;
        if (req.file) {
            contentToUpdate.image = `/uploads/admissions/${req.file.filename}`;
        }

        const updatedContent = await contentToUpdate.save();
        res.json({ success: true, data: updatedContent });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Error updating admission content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete admission content
exports.deleteAdmissionContent = async (req, res) => {
    try {
        const content = await Admission.findById(req.params.id);
        
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        // Delete associated image
        if (content.image) {
            const imagePath = path.join(__dirname, '..', content.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await content.deleteOne();
        res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Error deleting admission content:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
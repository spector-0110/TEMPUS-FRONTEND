'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Smartphone,
  IndianRupee,
} from 'lucide-react';
import { STAFF_CONSTANTS, getDisplayName } from '@/lib/api/staffAPI';
import { useStaffPayments } from '@/hooks/useStaff';
import { useIsMobile } from '@/hooks/use-mobile';
import { validateCreateStaffPaymentData, validateUpdateStaffPaymentData } from '@/lib/validation/staff-validation';

export function StaffPaymentsManager({ staffId, staffName }) {
  const isMobile = useIsMobile();
  const {
    payments,
    loading,
    error,
    filters,
    updateFilters,
    paymentStats,
    addPayment,
    updatePayment,
    deletePayment
  } = useStaffPayments(staffId);
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, payment: null });
  const [showFilters, setShowFilters] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    type: '', // 'success', 'error', 'warning'
    action: null
  });
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      amount: '',
      paymentType: 'salary',
      paymentMode: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: ''
    }
  });
  
  const watchedValues = watch();
  
  useEffect(() => {
    if (editingPayment) {
      reset({
        amount: editingPayment.amount.toString(),
        paymentType: editingPayment.paymentType,
        paymentMode: editingPayment.paymentMode,
        paymentDate: new Date(editingPayment.paymentDate).toISOString().split('T')[0],
        remarks: editingPayment.remarks || ''
      });
    } else {
      reset({
        amount: '',
        paymentType: 'salary',
        paymentMode: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
    }
  }, [editingPayment, reset]);
  
  const onSubmit = async (data) => {
    setValidationErrors({});
    
    try {
      const paymentData = {
        ...data,
        amount: parseFloat(data.amount),
        paymentDate: new Date(data.paymentDate).toISOString(),
      };
      
      // Validate data using our validation functions
      let validationResult;
      if (editingPayment) {
        validationResult = validateUpdateStaffPaymentData({ 
          ...paymentData 
        });
      } else {
        validationResult = validateCreateStaffPaymentData(paymentData);
      }

      if (!validationResult.isValid) {
        const errors = {};
        validationResult.errors.forEach(error => {
          errors[error.field] = { message: error.message };
        });
        setValidationErrors(errors);
        setAlertDialog({
          isOpen: true,
          title: 'Validation Failed',
          description: 'Please check all fields and try again.',
          type: 'error',
          action: () => document.querySelector('[aria-invalid="true"]')?.focus()
        });
        return;
      }

      // Check if there are any actual changes when editing
      if (editingPayment) {
        const hasChanges = Object.keys(paymentData).some(key => 
          paymentData[key] !== editingPayment[key]
        );
        
        if (!hasChanges) {
          setAlertDialog({
            isOpen: true,
            title: 'No Changes Detected',
            description: 'No modifications were made to the payment details.',
            type: 'warning'
          });
          setShowPaymentDialog(false);
          setEditingPayment(null);
          return;
        }
      }
      
      if (editingPayment) {
        await updatePayment(editingPayment.id, validationResult.data);
        setAlertDialog({
          isOpen: true,
          title: 'Payment Updated Successfully',
          description: `Successfully updated payment of ₹${paymentData.amount.toLocaleString()}`,
          type: 'success',
          action: () => document.getElementById(`payment-${editingPayment.id}`)?.scrollIntoView({ behavior: 'smooth' })
        });
      } else {
        const newPayment = await addPayment(validationResult.data);
        setAlertDialog({
          isOpen: true,
          title: 'Payment Created Successfully',
          description: `Successfully added new ${paymentData.paymentType} payment of ₹${paymentData.amount.toLocaleString()}`,
          type: 'success',
          action: () => document.getElementById(`payment-${newPayment.id}`)?.scrollIntoView({ behavior: 'smooth' })
        });
      }
      
      setShowPaymentDialog(false);
      setEditingPayment(null);
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Operation Failed',
        description: error.message || 'An unexpected error occurred while processing the payment',
        type: 'error',
        action: () => handleSubmit(onSubmit)()
      });
    }
  };
  
  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setShowPaymentDialog(true);
  };
  
  const handleDelete = (payment) => {
    setDeleteConfirm({ isOpen: true, payment });
  };
  
  const confirmDelete = async () => {
    if (deleteConfirm.payment) {
      try {
        const payment = deleteConfirm.payment;
        await deletePayment(payment.id);
        setDeleteConfirm({ isOpen: false, payment: null });
        
        setAlertDialog({
          isOpen: true,
          title: 'Payment Deleted Successfully',
          description: `Successfully deleted ${payment.paymentType} payment of ₹${payment.amount.toLocaleString()}`,
          type: 'success',
        });
      } catch (error) {
        setAlertDialog({
          isOpen: true,
          title: 'Delete Failed',
          description: error.message || 'Unable to delete the payment',
          type: 'error',
          action: () => confirmDelete(),
          actionLabel: 'Try Again'
        });
      }
    }
  };
  
  const getPaymentModeIcon = (mode) => {
    switch (mode) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'bank_transfer':
      case 'net_banking':
        return <CreditCard className="w-4 h-4" />;
      case 'upi':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <IndianRupee className="w-4 h-4" />;
    }
  };
  
  const getPaymentTypeColor = (type) => {
    switch (type) {
      case 'salary':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'advance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'bonus':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'loan':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Payment Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold">₹{paymentStats.totalAmount.toLocaleString()}</p>
              </div>
              <IndianRupee className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Payments</p>
                <p className="text-lg font-bold">{paymentStats.totalPayments}</p>
              </div>
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Average</p>
                <p className="text-lg font-bold">₹{Math.round(paymentStats.averagePayment).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-bold">
                  ₹{payments
                    .filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth())
                    .reduce((sum, p) => sum + parseInt(p.amount), 0)
                    .toLocaleString()
                  }
                </p>
              </div>
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowPaymentDialog(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Select
                value={filters.paymentType || 'all'}
                onValueChange={(value) => updateFilters({ paymentType: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(STAFF_CONSTANTS.PAYMENT_TYPES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {getDisplayName.paymentType(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.paymentMode || 'all'}
                onValueChange={(value) => updateFilters({ paymentMode: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  {Object.entries(STAFF_CONSTANTS.PAYMENT_MODES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {getDisplayName.paymentMode(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                placeholder="From Date"
                value={filters.fromDate || ''}
                onChange={(e) => updateFilters({ fromDate: e.target.value })}
              />
              
              <Input
                type="date"
                placeholder="To Date"
                value={filters.toDate || ''}
                onChange={(e) => updateFilters({ toDate: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Payments List */}
      <div className="space-y-2">
        {loading && payments.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-2">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading payments...</p>
            </div>
          </div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <IndianRupee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
              <p className="text-muted-foreground mb-4">
                No payment records found for this staff member.
              </p>
              <Button onClick={() => setShowPaymentDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Payment
              </Button>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getPaymentModeIcon(payment.paymentMode)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">
                          ₹{payment.amount.toLocaleString()}
                        </h4>
                        <Badge className={getPaymentTypeColor(payment.paymentType)}>
                          {getDisplayName.paymentType(payment.paymentType)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getPaymentModeIcon(payment.paymentMode)}
                          <span>{getDisplayName.paymentMode(payment.paymentMode)}</span>
                        </div>
                      </div>
                      
                      {payment.remarks && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {payment.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(payment)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Payment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(payment)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Payment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none h-[95vh]' : 'max-w-md'} overflow-hidden`}>
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? 'Edit Payment' : 'Add Payment'}
            </DialogTitle>
            <DialogDescription>
              {editingPayment 
                ? 'Update payment details'
                : `Add a new payment record for ${staffName}`
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type *</Label>
                <Select
                  value={watchedValues.paymentType}
                  onValueChange={(value) => setValue('paymentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STAFF_CONSTANTS.PAYMENT_TYPES).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {getDisplayName.paymentType(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode *</Label>
                <Select
                  value={watchedValues.paymentMode}
                  onValueChange={(value) => setValue('paymentMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STAFF_CONSTANTS.PAYMENT_MODES).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {getPaymentModeIcon(value)}
                          {getDisplayName.paymentMode(value)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                {...register('paymentDate', {
                  required: 'Payment date is required'
                })}
                className={errors.paymentDate ? 'border-destructive' : ''}
              />
              {errors.paymentDate && (
                <p className="text-sm text-destructive">{errors.paymentDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Additional notes about this payment"
                {...register('remarks')}
                className="min-h-[80px]"
              />
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setEditingPayment(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {editingPayment ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    {editingPayment ? 'Update Payment' : 'Add Payment'}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment of{' '}
              <strong>₹{deleteConfirm.payment?.amount?.toLocaleString()}</strong>?{' '}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm({ isOpen: false, payment: null })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Operation Result Dialog */}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={(isOpen) => !isOpen && setAlertDialog(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={
              alertDialog.type === 'success' ? 'text-green-600' :
              alertDialog.type === 'error' ? 'text-destructive' :
              alertDialog.type === 'warning' ? 'text-orange-600' : ''
            }>
              {alertDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            {alertDialog.type !== 'success' && (
              <AlertDialogCancel onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}>
                Cancel
              </AlertDialogCancel>
            )}
            <AlertDialogAction 
              onClick={() => {
                if (alertDialog.action) alertDialog.action();
                setAlertDialog(prev => ({ ...prev, isOpen: false }));
              }}
              className={alertDialog.type === 'error' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {alertDialog.actionLabel || (alertDialog.action ? 'View' : 'OK')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

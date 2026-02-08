import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Transaction } from '../../services/pos.service';

interface InvoiceModalProps {
    transaction: Transaction;
    isOpen: boolean;
    onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, isOpen }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useReactToPrint({
        contentRef: contentRef as any,
        documentTitle: `Invoice_${transaction?._id?.slice(-8).toUpperCase() || 'NEW'}`,
    });

    if (!isOpen || !transaction) return null;

    return null;
};

export default InvoiceModal;

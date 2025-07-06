import useAuth from '../../../Hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FaCopy, FaHistory } from 'react-icons/fa';
import usePaymentHistory from '../../../Hooks/usePaymentHistory';

const PaymentHistory = () => {
  const { paymentHistory, isPaymentHistoryLoading } = usePaymentHistory();
  const { user } = useAuth();

  // --- Function to handle copying text to clipboard ---
  const handleCopyToClipboard = (textToCopy, toastMessage) => {
    // This method is more robust for different browser environments
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      toast.success(toastMessage);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy!');
    }
    document.body.removeChild(textArea);
  };

  if (isPaymentHistoryLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-lg loading-spinner text-lime-500"></span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-1">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Payment History</h1>
        <p className="mt-2 text-gray-500">
          A record of all your successful transactions.
        </p>
      </div>

      {paymentHistory.length > 0 ? (
        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="table w-full">
            {/* Table Head */}
            <thead className="bg-gray-50 text-sm uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Parcel ID</th>
                <th className="p-4 text-center">Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold">{user?.displayName}</div>
                    <div className="text-sm opacity-60">
                      {payment.userEmail}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    <div
                      className="tooltip tooltip-right"
                      data-tip="Copy Transaction ID"
                    >
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            payment.transactionId,
                            'Transaction ID copied!',
                          )
                        }
                        className="btn flex items-center gap-2 btn-ghost btn-xs"
                      >
                        <FaCopy className="text-gray-400" />
                        {payment.transactionId}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    <div
                      className="tooltip tooltip-right"
                      data-tip="Copy Parcel ID"
                    >
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            payment.parcelId,
                            'Parcel ID copied!',
                          )
                        }
                        className="btn flex items-center gap-2 btn-ghost btn-xs"
                      >
                        <FaCopy className="text-gray-400" />
                        {payment.parcelId}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold text-lime-600">
                    ৳{payment.amount}
                  </td>
                  <td className="p-4">
                    {format(new Date(payment.paymentDate), 'PPpp')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-24 text-center">
          <div className="mx-auto w-fit rounded-full bg-blue-100 p-4">
            <FaHistory size={40} className="text-blue-500" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-gray-600">
            No Payment History
          </h2>
          <p className="mt-2 text-gray-400">
            You haven't made any payments yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

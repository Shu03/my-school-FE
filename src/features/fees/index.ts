/**
 * Public API of the fees feature.
 *
 * Pages are intentionally NOT exported here — router lazy imports pages directly.
 */

export {
    feesKeys,
    useBackfillFees,
    useCreateFeeStructure,
    useFeeRecord,
    useFeeRecordsList,
    useFeeStructuresList,
    useRecordPayment,
    useStudentFeeHistory,
    useUpdateFeeStructure,
} from "./hooks/useFees";

export type {
    BackfillResult,
    CreateFeeStructureRequest,
    FeePayment,
    FeeRecord,
    FeeRecordsListParams,
    FeeRecordWithPayments,
    FeeStructure,
    FeeStructuresListParams,
    RecordPaymentRequest,
    UpdateFeeStructureRequest,
} from "./types/fee.types";

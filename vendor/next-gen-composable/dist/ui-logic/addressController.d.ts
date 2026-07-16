import type { AddressService } from '../core/port';
import type { RuntimeContext } from '../core/runtime';
import type { AddressDTO, AddressField, AddressSuggestion, AddressType, FieldIssues, MutationResult, SavedAddress } from '../core/types';
export type AddressEntryMode = 'search' | 'manual';
export interface AddressControllerState {
    mode: AddressEntryMode;
    query: string;
    searching: boolean;
    suggestions: AddressSuggestion[];
    /** True once the search/validation provider has failed — manual entry takes over. */
    searchDegraded: boolean;
    savedAddresses: SavedAddress[];
    loadingSaved: boolean;
    draft: AddressDTO;
    issues: FieldIssues;
    submitting: boolean;
    resolvingSuggestionId: string | null;
    selected: AddressDTO | null;
    errorMessage: string | null;
}
export interface AddressControllerCallbacks {
    onAddressSelected?: (address: AddressDTO) => void;
    onAddressChange?: (address: AddressDTO) => void;
}
export interface AddressControllerOptions extends AddressControllerCallbacks {
    service: AddressService;
    context: RuntimeContext;
    addressType: AddressType;
    debounceMs?: number;
    minQueryLength?: number;
}
export interface AddressController {
    getState(): AddressControllerState;
    subscribe(listener: () => void): () => void;
    setCallbacks(callbacks: AddressControllerCallbacks): void;
    /** Loads saved addresses when the identity has an account (no-op for guests). */
    init(): Promise<void>;
    setQuery(text: string): void;
    selectSuggestion(suggestionId: string): Promise<MutationResult>;
    selectSavedAddress(savedAddressId: string): MutationResult;
    setMode(mode: AddressEntryMode): void;
    setDraftField(field: AddressField, value: string): void;
    submitManualAddress(): Promise<MutationResult>;
    dispose(): void;
}
export declare function createAddressController(options: AddressControllerOptions): AddressController;

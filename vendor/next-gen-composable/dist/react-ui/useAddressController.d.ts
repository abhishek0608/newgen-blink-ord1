import type { AddressController, AddressControllerOptions, AddressControllerState } from '../ui-logic/addressController';
export interface UseAddressControllerResult {
    state: AddressControllerState;
    controller: AddressController;
}
/**
 * Binds an AddressController to React. The controller is created once per
 * mount; callbacks are kept fresh across renders via setCallbacks.
 */
export declare function useAddressController(options: AddressControllerOptions): UseAddressControllerResult;

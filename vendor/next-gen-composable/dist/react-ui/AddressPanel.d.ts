import type { AddressService } from '../core/port';
import type { RuntimeContext } from '../core/runtime';
import type { AddressDTO, AddressType } from '../core/types';
export interface AddressPanelProps {
    context: RuntimeContext;
    service: AddressService;
    addressType: AddressType;
    onAddressSelected?: (address: AddressDTO) => void;
    onAddressChange?: (address: AddressDTO) => void;
    title?: string;
    debounceMs?: number;
    minQueryLength?: number;
    /** Accordion control (host-driven, like checkout.vue's expand map). Uncontrolled + open by default. */
    expanded?: boolean;
    onExpandChange?: (expanded: boolean) => void;
}
export declare function AddressPanel(props: AddressPanelProps): import("react").JSX.Element;

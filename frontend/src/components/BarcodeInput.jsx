import { forwardRef } from "react";

const BarcodeInput = forwardRef(function BarcodeInput(
  { autoFocus = true, className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      autoFocus={autoFocus}
      inputMode="numeric"
      className={`field ${className}`}
      {...props}
    />
  );
});

export default BarcodeInput;


import { useEffect, useRef } from "react";

function ScannerInput({ autoFocus = false, onScannerSubmit, ...props }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [autoFocus]);

  function handleKeyDown(event) {
    if (event.key === "Enter" && onScannerSubmit) {
      event.preventDefault();
      onScannerSubmit(event.currentTarget.value);
    }
  }

  return <input ref={inputRef} onKeyDown={handleKeyDown} {...props} />;
}

export default ScannerInput;

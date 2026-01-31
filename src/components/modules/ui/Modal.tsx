import useModalStore from "@/stores/modalStore";
import Button from "./Button";

const Modal = () => {
  const {
    title,
    bodyText,
    isOpen,
    okText,
    cancelText,
    isCheckedText,
    isChecked,
    setter,
    onSubmit,
    resetModal,
  } = useModalStore((state) => state);

  return (
    <dialog id="modal" className={`modal  ${isOpen && "modal-open"} `}>
      <div className="modal-box bg-modalBg text-white z-50">
        <h3 className="font-vazirBold text-base">{title}</h3>
        <p className="pt-2 w-full font-vazirRegular text-sm ">{bodyText}</p>

        {Boolean(isCheckedText?.length) && (
          <label
            htmlFor="checkbox"
            className="cursor-pointer flex items-center gap-2 mt-4"
          >
            <input
              id="checkbox"
              type="checkbox"
              checked={isChecked}
              onChange={() => {
                setter({ isChecked: !isChecked });
              }}
              className="checkbox checkbox-xs rounded-sm checkbox-info mb-1 "
            />
            <span className="text-sm">{isCheckedText}</span>
          </label>
        )}

        <div className="modal-action">
          <Button
            size="sm"
            variant="ghost"
            color="neutral"
            onClick={() => {
              resetModal!();
            }}
          >
            {cancelText}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onSubmit();
              resetModal!();
            }}
          >
            {okText}
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;

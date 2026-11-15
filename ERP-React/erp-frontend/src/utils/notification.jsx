import toast from "react-hot-toast";

const notification = {
    success: (message) => {
        toast.success(message);
    },

    error: (message) => {
        toast.error(message);
    },

    info: (message) => {
        toast(message);
    },

    loading: (message) => {
        return toast.loading(message);
    },

    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },

    promise: (promise, messages) => {
        return toast.promise(
            promise,
            messages
        );
    },
};

export default notification;

import Swal from "sweetalert2";

export const showToast = (title, icon = "success") => {
    return Swal.fire({
        toast: true,
        position: "top-end",
        icon,
        title,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
};

export const showAlert = (
    title,
    text = "",
    icon = "error"
) => {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: "OK",
        confirmButtonColor: "#3157d5"
    });
};

export const confirmDelete = async (
    title = "Delete purchase order?",
    text = "This action cannot be undone."
) => {
    const result = await Swal.fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
        reverseButtons: true,
        focusCancel: true
    });

    return result.isConfirmed;
};

export default Swal;
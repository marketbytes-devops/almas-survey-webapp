import { motion } from "framer-motion";

const modalVariants = {
    hidden: { opacity: 0, y: "-50%" },
    visible: { opacity: 1, y: "0%" },
};

const Modal = ({ isOpen, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={modalVariants}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h2 className="text-xl font-semibold text-[#2d4a5e] mb-4">{title}</h2>
                    <div className="mb-4">{children}</div>
                    <div className="flex justify-end space-x-2">{footer}</div>
                </div>
            </motion.div>
            <div className="fixed inset-0 backdrop-brightness-50 z-40 flex items-center justify-center">
            </div>
        </>
    );
};

export default Modal;
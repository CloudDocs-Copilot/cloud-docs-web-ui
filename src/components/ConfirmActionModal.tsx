import React from 'react';
import { useId } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

type ConfirmActionModalProps = {
  show: boolean;
  title: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'secondary' | 'outline-danger' | 'outline-secondary';
  processing?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  show,
  title,
  children,
  confirmLabel = 'Confirmar',
  confirmVariant = 'primary',
  processing = false,
  onCancel,
  onConfirm,
}) => {
  const titleId = useId();

  return (
    <Modal show={show} onHide={onCancel} centered aria-labelledby={titleId} aria-modal={true}>
      <Modal.Header closeButton>
        <Modal.Title id={titleId}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={processing}>
          Cancelar
        </Button>
        <Button
          variant={confirmVariant}
          size="sm"
          onClick={async () => {
            await onConfirm();
          }}
          disabled={processing}
        >
          {processing ? <Spinner animation="border" size="sm" /> : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmActionModal;

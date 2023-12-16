import { useCallback, useState } from "react";
import { ListGroup, Modal, Button, Form } from "react-bootstrap";
import { TiDeleteOutline } from "react-icons/ti";
import { BiEditAlt } from "react-icons/bi";
import "./Event.scss";

const Event = ({ event, selectedEventId, selectEvent, deleteEvent, updateEvent }) => {
  const [showEditEventModel, setShowEditEventModal] = useState(false);
  const [eventName, setEventName] = useState(event.name);

  const handleClick = () => {
    selectEvent(event.id);
  }

  const handleDelete = () => {
    deleteEvent(event.id);
  }

  const openModal = () => {
    setShowEditEventModal(true);
  }

  const closeModel = () => {
    setShowEditEventModal(false);
  }

  const handleUpdate = useCallback(() => {
    updateEvent(event.id, eventName);
    setShowEditEventModal(false);
  }, [event, eventName, updateEvent])

  const handleEventNameChanges = e => {
    setEventName(e.target.value);
  }

  return (
    <ListGroup.Item variant="secondary" key={event.id} active={event.id === selectedEventId} className="event" action onClick={handleClick} >
      <span>
        #{event.name}
      </span>
      <span className="delete">
        <BiEditAlt size="1.5em" onClick={openModal} />
        <TiDeleteOutline size="1.5em" onClick={handleDelete} />
      </span>
      <Modal show={showEditEventModel} onHide={closeModel}>
        <Modal.Header closeButton>
          <Modal.Title>イベント変更</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput5">
            <Form.Label>イベント名</Form.Label>
            <Form.Control type="text" value={eventName} onChange={handleEventNameChanges} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleUpdate}>
            更新
          </Button>
        </Modal.Footer>
      </Modal>
    </ListGroup.Item>
  );
}

export default Event;
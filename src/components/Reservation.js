import "./Reservation.scss";
import { BsPersonCircle } from "react-icons/bs";

const Reservation = ({ Reservation }) => {
  return (
    <div className="reservation">
      <div className="reservation-icon">
        <BsPersonCircle size="1.5em" />
      </div>
      <div className="reservation-body">
        <div>
          <span className="reservation-username">{Reservation.username}</span>
          <span className="fw-light">{timestamp.toLocalString('ja-JP')}</span>
        </div>
        <p>{Reservation.text}</p>
      </div>
    </div>
  );
}

export default Reservation;
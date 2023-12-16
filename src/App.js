import { Container, Form, Button, Row, Col, ListGroup, Navbar, InputGroup, FormControl, Alert, Modal } from "react-bootstrap";
import React, { useCallback, useEffect, useReducer } from "react";
import './App.scss';
import Event from './components/Event';
import Reservation from './components/Reservation';

const initialState = {
  url: 'http://localhost:8080/aufguss',
  isLogin: false,
  username: "",
  passowrd: "",
  infoMessage: "",
  errorMessage: "",
  token: "",
  events: [],
  reservations: [],
  typedMessage: "",
  selectedEventId: -1,
  showAddEventModal: false,
  eventName: "",
  searchWord: ""
}

const reducer = (state, action) => {
  switch (action.type) {
    case "URL_CHANGE":
      return {
        ...state,
        url: action.url
      };
    case "USERNAME_CHANGE":
      return {
        ...state,
        username: action.username
      };
    case "PASSWORD_CHANGE":
      return {
        ...state,
        password: action.password
      };
    case "SIGNUP_SUCCESS":
      return {
        ...state,
        infoMessage: "ユーザー追加完了しました。追加したユーザでログインしてください。",
        errorMessage: ""
      };
    case "SIGNUP_FAILURE":
      return {
        ...state,
        infoMessage: "",
        errorMessage: "入力されたユーザー名はすでに使用されています。"
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLogin: true,
        password: "",
        infoMessage: "",
        errorMessage: "",
        token: action.token
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isLogin: false,
        infoMessage: "",
        errorMessage: "ユーザー名またはパスワードが間違っています。",
        password: ""
      };
    case "LOGIN_SKIP":
      return {
        ...state,
        isLogin: true
      }
    case "LOGOUT":
      return {
        ...initialState
      };
    case "LOGIN_EXPIRED":
      return {
        ...initialState,
        errorMessage: "認証セッションが切れました。再度ログインしてください。"
      };
    case "UPDATE_EVENT":
      return {
        ...state,
        events: action.events,
        selectedEventId: action.selectedEventId
      }
    case "UPDATE_RESERVATIONS":
      return {
        ...state,
        reservations: action.reservations
      };
    case "TYPED_MESSAGE_CHANGE":
      return {
          ...state,
          typedMessage: action.typedMessage
        };
    case "POST_SUCCESS":
      return {
        ...state,
        typedMessage: ""
      };
    case "SELECT_EVENT_ID":
      return {
        ...state,
        selectedEventId: action.selectedEventId,
        searchWord: ''
      };
    case "OPEN_ADD_EVENT_MODAL":
      return {
        ...state,
        showAddEventModal: true
      };
    case "CLOSE_ADD_EVENT_MODAL":
      return {
        ...state,
        eventName: "",
        showAddEventModal: false
      };
    case "EVENT_NAME_CHANGE":
      return {
        ...state,
        eventName: action.eventName
      };
    case "SEARCH_WORD_CHANGE":
      return {
        ...state,
        searchWord: action.searchWord
      };
    default:
      return state;
  }
}
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { url, isLogin, username, password, infoMessage, errorMessage, token, events, reservations, typedMessage, selectedEventId, showAddEventModal, eventName, searchWord } = state;
  const reservationsContainer = React.createRef();

  const handleUrlChanges = (e) => {
    dispatch({
      type: "URL_CHANGE",
      url: e.target.value
    });
  }
  const handleUsernameChanges = (e) => {
    dispatch({
      type: "USERNAME_CHANGE",
      username: e.target.value
    });
  }
  const handlePasswordChanges = (e) => {
    dispatch({
      type: "PASSWORD_CHANGE",
      password: e.target.value
    });
  }

  const handleTypedMessageChanges = (e) => {
    dispatch({
      type: "TYPED_MESSAGE_CHANGE",
      typedMessage: e.target.value
    });
  }
  const login = () => {
    fetch(`${url}/auth/token`, {
      method: 'post',
      headers: new Headers({
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      })
    }).then(res => {
      if (res.status === 200) {
        res.text().then(
          resToken => {
            dispatch({
              type: "LOGIN_SUCCESS",
              token: resToken
            })
          }
        )
      } else {
        dispatch({
          type: "LOGIN_FAILURE"
        });
      }
    });
  }
  const loginSkip = () => {
    dispatch({
      type: "LOGIN_SKIP"
    })
  }
  const signup = () => {
    const user = {
      username: username,
      password: password
    };

    fetch(`${url}/auth/signup`, {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(user)
    }).then(res => {
      if (res.status === 200) {
        dispatch({
          type: "SIGNUP_SUCCESS"
        })
      } else {
        dispatch({
          type: "SIGNUP_FAILUER"
        })
      }
    })
  }
  const logout = () => {
    dispatch({
      type: "LOGOUT"
    })
  }
  const findEvent = useCallback(token => {
    fetch(`${url}/events`, {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      })
    })
      .then(res => {
        if (res.status === 200) {
          res.json()
            .then(events => {
              if(events.length === 0){
                dispatch({
                  type: "UPDATE_EVENT",
                  events: events,
                  selectedEventId: -1
                });
                dispatch({
                  type: "UPDATE_RESERVATIONS",
                  reservations: []
                })
              } else {
                dispatch({
                  type: "UPDATE_EVENT",
                  events: events,
                  selectedEventId: events.map(event => event.id).reduce((a, b) => Math.min(a, b))
                });
              }
            });
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          });
        }
      })
  }, [url]);
  useEffect(() => {
    if (isLogin) {
      findEvent(token)
    }
  }, [isLogin, token, findEvent])
  const setSelectedEventId = eventId => {
    dispatch({
      type: "SELECT_EVENT_ID",
      selectedEventId: eventId
    })
  }
  const findReservation = useCallback((eventId, searchWord) => {
    const wordCondition = searchWord ? `?searchWord=${searchWord}` : '';
    fetch(`${url}/events/${eventId}/reservations${wordCondition}`, {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      })
    })
      .then(res => {
        if (res.status === 200) {
          res.json().then(
            reservations => {
              dispatch({
                type: "UPDATE_RESERVATIONS",
                reservations: reservations
              })
            }
          )
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [token, url]);

  useEffect(() => {
    if (selectedEventId !== -1) {
      findReservation(selectedEventId, '');
    }
  }, [selectedEventId, findReservation]);
  const postReservation = useCallback(() => {
    const body = {
      text: typedMessage
    };

    fetch(`${url}/events/${selectedEventId}/reservations`, {
      method: 'post',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    })
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: "POST_SUCCESS"
          })
          findReservation(selectedEventId, '')
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [selectedEventId, token, typedMessage, url, findReservation]);
  
  const scrollToLatest = useCallback(() => {
    if (reservationsContainer.current !== null) {
      const scroll = reservationsContainer.current.scrollHeight - reservationsContainer.current.clientHeight;
      reservationsContainer.current.scrollTo(0, scroll);
    }
  }, [reservationsContainer]);
  useEffect(() => scrollToLatest(), [scrollToLatest]);
  
  const openAddEvent = () => {
    dispatch({
      type: "OPEN_ADD_EVENT_MODAL"
    });
  }

  const closeAddEvent = () => {
    dispatch({
      type: "CLOSE_ADD_EVENT_MODAL"
    });
  }

  const handleEventNameChanges = (e) => {
    dispatch({
      type: "EVENT_NAME_CHANGE",
      eventName: e.target.value
    });
  }

  const addEvent = useCallback(() => {
    const body = {
      name: eventName
    };
    fetch(`${url}/events`, {
      method: 'post',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    })
      .then(res => {
        if (res.status === 200) {
          findEvent(token);
          dispatch({
            type: "CLOSE_ADD_EVENT_MODAL"
          })
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [token, eventName, url, findEvent]);

  const deleteEvent = useCallback(id => {
    fetch(`${url}/events/${id}`, {
      method: 'delete',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      })
    })
      .then(res => {
        if (res.status === 200) {
          findEvent(token);
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [token, url, findEvent]);

  const updateEvent = useCallback((id, name) => {
    const body = {
      name: name
    };
    fetch(`${url}/events/${id}`, {
      method: 'put',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    })
      .then(res => {
        if (res.status === 200) {
          findEvent(token);
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [token, url, findEvent]);

  const handleSearchWordChanges = (e) => {
    dispatch({
      type: "SEARCH_WORD_CHANGE",
      searchWord: e.target.value
    });
  }

  return (
    <Container>
      <Navbar bg='dark' variant='dark' fixed='top' className='navbar-header'>
        <Navbar.Brand>Chat App</Navbar.Brand>
        <Form className="d-flex">
          <FormControl
            type="text"
            placeholder="APIベースURL"
            className="bg-secondary me-4 navibar-header__url"
            value={url}
            onChange={handleUrlChanges}
          />
        </Form>
        {isLogin ?
          <React.Fragment>
            <Form className="d-flex navibar-header__search">
              <FormControl
                type="search"
                placeholder="Search"
                className="me-2"
                value={searchWord}
                onChange={handleSearchWordChanges}
              />
            </Form>
            <Button variant="outline-secondary" className='navibar-header__logout ' onClick={logout}>ログアウト</Button>
          </React.Fragment>
          : <React.Fragment />}
      </Navbar>
      {isLogin ? (
        <Row>
          <Col xs={3}>
            <Navbar bg='light' variant='light'>
              <Navbar.Brand>チャンネル</Navbar.Brand>
              <Button className='event-add' variant="outline-secondary" onClick={openAddEvent}>+</Button>
              <Modal show={showAddEventModal} onHide={closeAddEvent}>
                <Modal.Header closeButton>
                  <Modal.Title>イベント追加</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput5">
                    <Form.Label>イベント名</Form.Label>
                    <Form.Control type="text" value={eventName} onChange={handleEventNameChanges} />
                  </Form.Group></Modal.Body>
                <Modal.Footer>
                  <Button variant="outline-secondary" onClick={addEvent}>
                    追加
                  </Button>
                </Modal.Footer>
              </Modal>
            </Navbar>
            <ListGroup>
              {(events.map(event =>
                <Event event={event}
                  selectedEventId={selectedEventId}
                  selectEvent={(eventId) => setSelectedEventId(eventId)}
                  deleteEvent={(eventId) => deleteEvent(eventId)}
                  updateEvent={(eventId, eventName) => updateEvent(eventId, eventName)}
                  key={event.id} />))}
            </ListGroup>
          </Col>
          <Col>
            <Navbar bg='light' variant='light'>
              <Navbar.Brand>予約</Navbar.Brand>
            </Navbar>
            <div className='reservations' ref={reservationsContainer}>
              {(reservations.map(reservation => <Reservation reservation={reservation} key={reservation.id} />))}
            </div>
            <Navbar bg='light' variant='light' className='reservation-post'>
              <InputGroup className="mb-3">
                <FormControl placeholder="予約しよう" value={typedMessage} onChange={handleTypedReservationChanges} />
                <Button variant="outline-secondary" id="button-addon2" onClick={postMessage}>
                  投稿
                </Button>
              </InputGroup>
            </Navbar>
          </Col>
        </Row>
      ) : (
        <div className='login-form'>
          {infoMessage !== "" ?
            <Alert key="info" variant="info">
              {infoMessage}
            </Alert> :
            <React.Fragment />}
          {errorMessage !== "" ?
            <Alert key="danger" variant="danger">
              {errorMessage}
            </Alert> :
            <React.Fragment />}
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>ユーザー名</Form.Label>
              <Form.Control type="text" value={username} onChange={handleUsernameChanges} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>パスワード</Form.Label>
              <Form.Control type="password" value={password} onChange={handlePasswordChanges} />
            </Form.Group>
          </Form>
          <div className='login-form__button'>
            <Button variant="outline-secondary" onClick={loginSkip}>ログインスキップ</Button>
            <Button variant="outline-secondary" onClick={signup}>サインアップ</Button>
            <Button variant="outline-secondary" onClick={login}>ログイン</Button>
          </div>
        </div>
      )}
    </Container>
  );
}

export default App;
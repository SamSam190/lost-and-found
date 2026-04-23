import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Navbar, Nav, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // null means adding, else updating
  const [userId, setUserId] = useState('');

  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    date: '',
    contactInfo: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserId(decoded.user.id);
      } catch (e) {
        console.error('Token decode error');
      }
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return fetchItems();
    try {
      const res = await axios.get(`/api/items/search?name=${searchQuery}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleShowAdd = () => {
    setCurrentItem(null);
    setFormData({
      itemName: '',
      description: '',
      type: 'Lost',
      location: '',
      date: '',
      contactInfo: ''
    });
    setShowModal(true);
  };

  const handleShowEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: new Date(item.date).toISOString().split('T')[0], // format date for input
      contactInfo: item.contactInfo
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) {
        await axios.put(`/api/items/${currentItem._id}`, formData);
      } else {
        await axios.post('/api/items', formData);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('Error saving item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/items/${id}`);
        fetchItems();
      } catch (err) {
        console.error(err);
        alert('Error deleting item');
      }
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Lost & Found Management</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Row className="mb-4 align-items-center">
          <Col md={4}>
            <Button variant="success" onClick={handleShowAdd}>+ Report Item</Button>
          </Col>
          <Col md={8}>
            <Form onSubmit={handleSearch} className="d-flex">
              <Form.Control
                type="text"
                placeholder="Search by item name or category (Lost/Found)"
                className="me-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="primary">Search</Button>
            </Form>
          </Col>
        </Row>

        <Row>
          {items.map(item => (
            <Col md={4} key={item._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Header className={item.type === 'Lost' ? 'bg-danger text-white' : 'bg-success text-white'}>
                  {item.type} Item
                </Card.Header>
                <Card.Body>
                  <Card.Title>{item.itemName}</Card.Title>
                  <Card.Text><strong>Description:</strong> {item.description}</Card.Text>
                  <Card.Text><strong>Location:</strong> {item.location}</Card.Text>
                  <Card.Text><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</Card.Text>
                  <Card.Text><strong>Contact:</strong> {item.contactInfo}</Card.Text>
                  <Card.Text><strong>Reported By:</strong> {item.user?.name || 'Unknown'}</Card.Text>
                </Card.Body>
                {userId === (item.user?._id || item.user) && (
                  <Card.Footer className="bg-white border-top-0 d-flex justify-content-between">
                    <Button variant="warning" size="sm" onClick={() => handleShowEdit(item)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          ))}
          {items.length === 0 && <Col><p className="text-center text-muted">No items found.</p></Col>}
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{currentItem ? 'Update Item' : 'Report Item'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control type="text" name="itemName" value={formData.itemName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={formData.type} onChange={handleChange} required>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" name="location" value={formData.location} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Dashboard;

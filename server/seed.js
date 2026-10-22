import { initialize, read, write, hash, uid, log } from './store.js';
initialize();
const db = { users: [], shops: [], memberships: [], services: [], slots: [], bookings: [], inventory: [], purchaseOrders: [], notifications: [], sessions: [], audit: [] };
const pass = 'Demo@12345';
const users = {};
for (const [role, name] of Object.entries({ owner: 'Olivia Owner', advisor: 'Sam Advisor', technician: 'Tariq Technician', qc: 'Quinn Inspector', parts: 'Parker Parts', customer: 'Ayesha Customer' })) {
  users[role] = { id: uid(), name, email: `${role}@bayflow.demo`, password: hash(pass) }; db.users.push(users[role]);
}
const shops = [['Velocity Auto Studio', 'Gulberg III, Lahore', 'Premium diagnostics and specialist repairs', 'VA'], ['MotorCraft Garage', 'DHA Phase 5, Lahore', 'Trusted mechanics, transparent estimates', 'MC'], ['Urban Torque Works', 'Johar Town, Lahore', 'Modern care for every mile', 'UT']];
const services = ['Oil & Filter Change', 'Brake Inspection', 'Engine Diagnostics', 'Tyre & Wheel Care', 'AC Service', 'Battery & Electrical'];
for (let i = 0; i < shops.length; i++) {
  const [name, address, description, initials] = shops[i], shop = { id: uid(), name, address, description, initials, ownerId: users.owner.id, hours: '09:00–18:00', capacity: 2 }; db.shops.push(shop);
  for (const role of ['advisor', 'technician', 'qc', 'parts']) db.memberships.push({ id: uid(), shopId: shop.id, userId: users[role].id, role });
  db.memberships.push({ id: uid(), shopId: shop.id, userId: users.owner.id, role: 'owner' });
  services.forEach((service, j) => db.services.push({ id: uid(), shopId: shop.id, name: service, price: [4500, 3500, 6000, 3000, 5000, 2800][j] }));
  for (const [j, name, stock, cost] of [['brake-pad', 'Brake Pads', 9, 5000], ['oil-filter', 'Oil Filter', 12, 1100], ['engine-oil', 'Engine Oil (1L)', 35, 1800], ['battery', 'Car Battery', 5, 12000], ['air-filter', 'Air Filter', 8, 1500]]) db.inventory.push({ id: uid(), shopId: shop.id, sku: j, name, qty: stock, cost });
  for (let day = 0; day < 21; day++) { let date = new Date(); date.setDate(date.getDate() + day); const d = date.toISOString().slice(0, 10); for (const hour of [9, 11, 13, 15, 17]) db.slots.push({ id: uid(), shopId: shop.id, date: d, time: `${String(hour).padStart(2, '0')}:00`, capacity: 2 }) }
}
const b = { id: uid(), reference: 'BF-DEMO01', shopId: db.shops[0].id, customerId: users.customer.id, serviceIds: [db.services[0].id], notes: 'Brakes make a squeaking noise', vehicle: { plate: 'LEA-2026', make: 'Honda', model: 'Civic', year: 2020, color: 'Silver', mileage: 46000 }, slotId: db.slots[2].id, status: 'CONFIRMED', techId: null, partsId: null, qcId: null, estimate: [], qcIssues: [], partsAllocated: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; db.bookings.push(b); log(db, b, users.advisor.id, 'CONFIRMED', 'Sample confirmed booking');
write(db); console.log('Seeded 3 garages, 6 role accounts, services, inventory and slots. Password: ' + pass);

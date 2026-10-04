const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const build = mkdtempSync(path.join(tmpdir(), 'artniverse-cart-test-'));
execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--ignoreConfig', '--target', 'ES2020', '--module', 'commonjs', '--skipLibCheck', '--outDir', build, 'lib/commerce/cart.ts', 'lib/commerce/orders.ts']);
after(() => rmSync(build, { recursive: true, force: true }));
const { emptyCart, addCartItem, readCart, purchaseIssue, cartLineIssue, cartGroupId, shippingFor } = require(path.join(build, 'lib/commerce/cart.js'));
const now = Date.parse('2026-10-01T00:00:00Z');
const general = { id: '1', creatorId: '1', name: '商品', productType: 'general', stock: 3, price: 650, isActive: true };
const presale = { ...general, id: '3', productType: 'presale', presaleStartTime: new Date(now - 1000).toISOString(), presaleEndTime: new Date(now + 1000).toISOString(), targetBackers: 10, currentBackers: 9 };
const auction = { ...general, id: '2', productType: 'auction' };
const award = { productId: '2', amount: 2400, deadline: now + 86400000, rank: 2 };

test('same product merges; aggregate stock limit rejects without mutation', () => {
  const first = addCartItem(emptyCart(), general, 2, now).state;
  assert.equal(addCartItem(first, general, 1, now).state.items[0].quantity, 3);
  const rejected = addCartItem(first, general, 2, now);
  assert.ok(rejected.error); assert.equal(rejected.state, first);
});
test('invalid quantities, unavailable products and missing seller are rejected', () => {
  for (const q of [0, -1, 1.5, NaN, Infinity]) assert.ok(addCartItem(emptyCart(), general, q, now).error);
  for (const p of [undefined, { ...general, isActive: false }, { ...general, stock: 0 }, { ...general, creatorId: undefined }]) assert.ok(addCartItem(emptyCart(), p, 1, now).error);
});
test('presale is buyable only after start, before end, and below target', () => {
  assert.equal(purchaseIssue(presale, now), null);
  assert.ok(purchaseIssue(presale, now - 1001));
  assert.equal(purchaseIssue(presale, now - 1000), null);
  assert.ok(purchaseIssue(presale, now + 1000));
  assert.ok(purchaseIssue({ ...presale, currentBackers: 10 }, now));
  assert.ok(purchaseIssue({ ...presale, currentBackers: 11 }, now));
  assert.ok(purchaseIssue({ ...presale, presaleEndTime: null }, now));
});
test('presale adding never creates a payment deadline', () => {
  const line = addCartItem(emptyCart(), presale, 1, now).state.items[0];
  assert.equal(line.award, undefined);
});
test('cart rechecks presale cutoff, reached goal and reduced stock', () => {
  const line = { productId: presale.id, quantity: 2 };
  assert.ok(cartLineIssue(line, presale, now + 1000));
  assert.ok(cartLineIssue(line, { ...presale, currentBackers: 10 }, now));
  assert.ok(cartLineIssue(line, { ...presale, stock: 1 }, now));
});
test('auction requires valid matching award and blocks at exact expiry', () => {
  assert.ok(addCartItem(emptyCart(), auction, 1, now).error);
  assert.ok(addCartItem(emptyCart(), auction, 1, now, { ...award, productId: 'wrong' }).error);
  assert.ok(addCartItem(emptyCart(), auction, 1, now, { ...award, amount: NaN }).error);
  assert.ok(addCartItem(emptyCart(), auction, 1, award.deadline, award).error);
});
test('runner-up award retains its own price/deadline and is never duplicated', () => {
  const first = addCartItem(emptyCart(), auction, 1, now, award).state;
  const second = addCartItem(first, auction, 1, now, { ...award, amount: 9999, deadline: award.deadline + 1000 }).state;
  assert.equal(second.items.length, 1); assert.equal(second.items[0].quantity, 1);
  assert.deepEqual(second.items[0].award, award);
});
test('removal, reload and re-add cannot reset auction payment deadline', () => {
  const state = addCartItem(emptyCart(), auction, 1, now, award).state;
  const removed = readCart(JSON.stringify({ ...state, items: [] }));
  const readded = addCartItem(removed, auction, 1, now, { ...award, deadline: award.deadline + 100000 });
  assert.equal(readded.state.items[0].award.deadline, award.deadline);
  assert.ok(addCartItem(removed, auction, 1, award.deadline, { ...award, deadline: award.deadline + 100000 }).error);
});
test('storage restores quantities and award without trusting duplicate or malformed rows', () => {
  const state = addCartItem(addCartItem(emptyCart(), general, 2, now).state, auction, 1, now, award).state;
  assert.deepEqual(readCart(JSON.stringify(state)), state);
  const dirty = { awards: [award, { ...award, deadline: 0 }], items: [null, { productId: '1', quantity: -1 }, { productId: '1', quantity: 2 }, { productId: '1', quantity: 3 }] };
  assert.equal(readCart(JSON.stringify(dirty)).items.length, 1);
  for (const value of [null, '', '{broken', 'null', '{}', '{"items":true}']) assert.deepEqual(readCart(value), emptyCart());
});
test('checkout groups split by seller and type; each auction is independent', () => {
  assert.notEqual(cartGroupId(general), cartGroupId({ ...general, creatorId: '2' }));
  assert.notEqual(cartGroupId(general), cartGroupId(presale));
  assert.equal(cartGroupId(general), cartGroupId({ ...general, id: 'other' }));
  assert.notEqual(cartGroupId(auction), cartGroupId({ ...auction, id: 'other' }));
});
test('shipping threshold includes exactly 1000 and empty group costs zero', () => {
  assert.equal(shippingFor(0), 0); assert.equal(shippingFor(999), 80); assert.equal(shippingFor(1000), 0); assert.equal(shippingFor(1001), 0);
});

const { createCheckoutOrder, checkoutItems, applyPayment, paymentStatus, saveNewOrder, readOrders, payOrder } = require(path.join(build, 'lib/commerce/orders.js'));
const contact = { name: '示範收件人', phone: '0912345678', email: 'demo@example.com', address: '示範市示範路1號', paymentMethod: 'card' };
test('checkout includes only selected seller/type and snapshots its totals', () => {
  const order = createCheckoutOrder([{ productId: '1', quantity: 2 }, { productId: '3', quantity: 1 }], [general, presale], cartGroupId(general), 'draft-1', contact, now);
  assert.equal(order.items.length, 1); assert.equal(order.subtotal, 1300); assert.equal(order.shipping, 0); assert.equal(order.total, 1300);
  assert.equal(order.paymentDeadline, now + 86400000);
});
test('presale starts 24-hour payment deadline at order creation; auction preserves award expiry', () => {
  const presaleOrder = createCheckoutOrder([{ productId: '3', quantity: 1 }], [presale], cartGroupId(presale), 'draft-2', contact, now);
  assert.equal(presaleOrder.paymentDeadline, now + 86400000);
  const auctionOrder = createCheckoutOrder([{ productId: '2', quantity: 1, award }], [auction], cartGroupId(auction), 'draft-3', contact, now + 1000);
  assert.equal(auctionOrder.paymentDeadline, award.deadline); assert.equal(auctionOrder.subtotal, award.amount);
});
test('submit rejects empty group, reached presale, expired auction and invalid recipient', () => {
  assert.throws(() => checkoutItems([], [general], cartGroupId(general), now));
  assert.throws(() => checkoutItems([{ productId: '3', quantity: 1 }], [{ ...presale, currentBackers: 10 }], cartGroupId(presale), now));
  assert.throws(() => checkoutItems([{ productId: '2', quantity: 1, award }], [auction], cartGroupId(auction), award.deadline));
  assert.throws(() => createCheckoutOrder([{ productId: '1', quantity: 1 }], [general], cartGroupId(general), 'draft-4', { ...contact, name: ' ' }, now));
});
test('payment failure retries same order without extending deadline; paid is terminal', () => {
  const order = createCheckoutOrder([{ productId: '1', quantity: 1 }], [general], cartGroupId(general), 'draft-5', contact, now);
  const failed = applyPayment(order, false, now + 1); assert.equal(failed.status, 'failed');
  const paid = applyPayment(failed, true, now + 2); assert.equal(paid.id, order.id); assert.equal(paid.paymentDeadline, order.paymentDeadline); assert.equal(paid.status, 'paid');
  assert.equal(applyPayment(paid, false, now + 3).status, 'paid');
  assert.equal(paymentStatus(paid, order.paymentDeadline + 1), 'paid');
  assert.equal(applyPayment(order, true, order.paymentDeadline).status, 'expired');
});
test('persisted duplicate submission returns same order; another auction draft is rejected', () => {
  const storage = new Map();
  global.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const order = createCheckoutOrder([{ productId: '2', quantity: 1, award }], [auction], cartGroupId(auction), 'same-draft', contact, now);
  saveNewOrder(order); saveNewOrder(order); assert.equal(readOrders().length, 1);
  assert.throws(() => saveNewOrder({ ...order, id: 'other', draftId: 'other' }));
  payOrder(order.id, false, now + 1); payOrder(order.id, true, now + 2);
  assert.equal(readOrders().length, 1); assert.equal(readOrders()[0].status, 'paid');
  delete global.localStorage;
});

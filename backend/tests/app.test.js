const request = require('supertest');
const app = require('../src/app'); // supposons que app exporte votre Express instance

describe('/api/health', () => {
  it('doit renvoyer 200 et { status: "healthy" }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'healthy', version: "1.0.0" });
  });
});

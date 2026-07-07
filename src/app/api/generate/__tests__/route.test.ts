/**
 * @jest-environment node
 */
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/generate', () => {
  beforeEach(() => {
    // Ensure we don't accidentally call the real Gemini API by unsetting the key if it exists
    delete process.env.GEMINI_API_KEY;
  });

  const createMockRequest = (query: string) => {
    return new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  };

  it('routes "passport" queries to the passport mock schema', async () => {
    const req = createMockRequest('I need to renew my passport');
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.services[0].name).toBe('Indian Passport');
  });

  it('routes Hindi queries like "शादी" to the marriage certificate schema', async () => {
    const req = createMockRequest('मुझे शादी का सर्टिफिकेट चाहिए');
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.services[0].name).toBe('Marriage Certificate');
  });

  it('routes "driving" to driving licence schema', async () => {
    const req = createMockRequest('lost my driving licence');
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.services[0].name).toBe('Driving Licence');
  });
  
  it('falls back gracefully to Aadhaar if no keyword matches', async () => {
    const req = createMockRequest('random unrelated query xyz');
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.services[0].name).toBe('Aadhaar Card');
  });
});

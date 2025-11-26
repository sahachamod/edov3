// Payment Slip Upload - Auto-fix Script
// Run this with: node fix-payment-slip.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'buyer', 'invoices', 'page.tsx');

console.log('Reading file...');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Applying fixes...');

// Fix 1: Add paymentSlip state variable (after line 1776)
content = content.replace(
    /const \[bankDetails, setBankDetails\] = useState<PaymentDetail\[\]>\(\[\]\);/,
    `const [bankDetails, setBankDetails] = useState<PaymentDetail[]>([]);\n  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);`
);

// Fix 2: Reset paymentSlip in openPaymentModal
content = content.replace(
    /setPayWithAdvance\(false\);\s+setBankDetails\(\[\{/,
    `setPayWithAdvance(false);\n    setPaymentSlip(null);\n    setBankDetails([{`
);

// Fix 3: Update confirmation message
content = content.replace(
    /`Reference: \$\{reference \|\| 'N\/A'\}\\n\\n` \+\s+`Continue with payment submission\?`;/,
    "`Reference: \\${reference || 'N/A'}\\\\n` +\n      `Payment Slip: \\${paymentSlip ? paymentSlip.name : 'Not attached'}\\\\n\\\\n` +\n      `Continue with payment submission?`;"
);

// Fix 4: Update results type definition
content = content.replace(
    /const results: \{ invoiceId: number; success: boolean; error\?: string \}\[\] = \[\];/,
    `const results: { invoiceId: number; success: boolean; error?: string; paymentId?: number }[] = [];`
);

// Fix 5: Fix API endpoint port
content = content.replace(
    /'http:\/\/51\.75\.119\.133:8080\/api\/Payment'/,
    "'http://51.75.119.133:5243/api/Payment'"
);

// Fix 6: Add payment slip upload logic (this is the complex one)
const oldPaymentSuccess = /if \(res\.ok\) \{\s+const responseData = await res\.json\(\);\s+if \(debugMode\) \{\s+console\.log\('✅ Payment success:', responseData\);\s+\}\s+results\.push\(\{\s+invoiceId,\s+success: true\s+\}\);/s;

const newPaymentSuccess = `if (res.ok) {
          const responseData = await res.json();
          const paymentId = responseData.id || responseData.paymentId;

          if (debugMode) {
            console.log('✅ Payment success:', responseData);
          }

          // Step 2: Upload payment slip if file is attached
          let slipUploaded = true;
          if (paymentSlip && paymentId) {
            try {
              const formData = new FormData();
              formData.append('slip', paymentSlip);

              const slipRes = await fetch(\`http://51.75.119.133:5243/api/Payment/\${paymentId}/slip\`, {
                method: 'POST',
                headers: {
                  'Authorization': \`Bearer \${token}\`,
                },
                body: formData
              });

              if (!slipRes.ok) {
                const errorText = await slipRes.text();
                if (debugMode) {
                  console.error('⚠️ Slip upload failed:', errorText);
                }
                slipUploaded = false;
              } else {
                if (debugMode) {
                  console.log('✅ Slip uploaded successfully');
                }
              }
            } catch (slipErr: any) {
              console.error('⚠️ Slip upload error:', slipErr);
              slipUploaded = false;
            }
          }

          results.push({ 
            invoiceId, 
            success: true,
            paymentId,
            error: !slipUploaded && paymentSlip ? 'Payment created but slip upload failed' : undefined
          });`;

content = content.replace(oldPaymentSuccess, newPaymentSuccess);

// Fix 7: Update success message format
content = content.replace(
    /return r\.success \? `✅ \$\{invNo\}` : `❌ \$\{invNo\}: \$\{r\.error\}`;/,
    "return r.success ? `✅ \\${invNo}\\${r.error ? ` (\\${r.error})` : ''}` : `❌ \\${invNo}: \\${r.error}`;"
);

// Fix 8: Add file input to payment modal (find the comment textarea and add after it)
const oldCommentSection = /(<textarea\s+value=\{comment\}\s+onChange=\{[^}]+\}\s+className="[^"]+"\s+rows=\{1\}\s+placeholder="Add comment\.\.\."\s+\/>)\s+<\/div>\s+<\/div>/s;

const newCommentSection = `$1
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Payment Slip (Optional)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentSlip(e.target.files?.[0] || null)}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                  />
                  {paymentSlip && (
                    <p className="text-green-400 text-sm mt-2">📎 {paymentSlip.name}</p>
                  )}
                </div>
              </div>`;

content = content.replace(oldCommentSection, newCommentSection);

console.log('Writing changes...');
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ All fixes applied successfully!');
console.log('Please review the changes and test the payment slip upload functionality.');

import * as chai from "../lib/chai/index.js";
import sinon from "../lib/sinon/sinon-esm.js";
import { TipoProductoService } from "../../../src/js/control/TipoProductoService.js";

mocha.setup('tdd');

let servicio;
let fetchStub;

suite('TipoProductoService', function() {
  setup(function() {
    servicio = new TipoProductoService();
    fetchStub = sinon.stub(window, 'fetch');
  });

  teardown(function() {
    sinon.restore();
  });

  test('findRange devuelve registros y total', function(done) {
    fetchStub.resolves(new Response(JSON.stringify([{}, {}]), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Total-Records': '2' }
    }));

    servicio.findRange(0, 10)
      .then(function(resp) {
        chai.expect(resp).to.be.an('object');
        chai.expect(resp.registros).to.be.an('array').with.lengthOf(2);
        chai.expect(resp.total).to.equal(2);
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('propaga errores HTTP', function(done) {
    fetchStub.resolves(new Response(JSON.stringify({ error: 'Error de prueba' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }));

    servicio.findRange(0, 10)
      .then(function() { done(new Error('Se esperaba un error HTTP')); })
      .catch(function(err) {
        chai.expect(err.message).to.equal('Error de prueba');
        done();
      });
  });
});

mocha.run();

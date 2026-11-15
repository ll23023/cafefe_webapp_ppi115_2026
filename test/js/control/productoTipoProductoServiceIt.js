import * as chai from "../lib/chai/index.js";
import { ProductoTipoProductoService } from "../../../src/js/control/ProductoTipoProductoService.js";

mocha.setup('bdd');

describe("ProductoTipoProductoService", function() {
  it("instancia el servicio", function() {
    var cut = new ProductoTipoProductoService();
    chai.assert.isDefined(cut);
    chai.expect(cut).to.be.an.instanceOf(ProductoTipoProductoService);
  });

  it("consulta el rango real de registros", function(done) {
    var cut = new ProductoTipoProductoService();
    cut.findRange(0, 10)
      .then(function(resp) {
        chai.expect(resp).to.be.an('object');
        chai.expect(resp.registros).to.be.an('array');
        chai.expect(resp.total).to.be.a('number').and.to.be.at.least(0);
        done();
      })
      .catch(function(err) { done(err); });
  });

  it("consulta un registro real por su identificador cuando existe", function(done) {
    var cut = new ProductoTipoProductoService();
    cut.findRange(0, 1)
      .then(function(resp) {
        if (resp.registros.length === 0) {
          done();
          return;
        }

        var id = resp.registros[0].idProductoTipoProducto;
        cut.findById(id)
          .then(function(registro) {
            chai.expect(registro).to.be.an('object');
            chai.expect(registro.idProductoTipoProducto).to.equal(id);
            done();
          })
          .catch(function(err) { done(err); });
      })
      .catch(function(err) { done(err); });
  });
});

mocha.run();

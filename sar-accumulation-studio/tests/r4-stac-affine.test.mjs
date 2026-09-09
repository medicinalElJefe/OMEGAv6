import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStacAffineOrientation, stacAffineGeolocate } from '../src/sentinel1-calibration-r4.mjs';

const detail={
  bbox:[-113.606224,30.669643,-110.625183,32.58379],
  properties:{
    'proj:epsg':4326,
    'proj:shape':[25671,16719],
    'proj:transform':[0.00017830258986781448,0,-113.606224,0,-0.00007456456702115227,32.58379],
    'proj:bbox':[-113.606224,30.669643,-110.625183,32.58379]
  }
};
const image={getWidth:()=>25671,getHeight:()=>16719};

test('Sentinel COG STAC affine resolves the provider axis orientation against declared bbox',()=>{
  const support=resolveStacAffineOrientation(detail,image);
  assert.equal(support.state,'STAC_AFFINE_READY');
  assert.equal(support.orientation,'SWAPPED_SOURCE_AXES');
  assert.ok(support.swappedError<1e-5);
  assert.ok(support.directError>support.swappedError*1000);
});

test('Tucson target maps inside the actual Sentinel measurement COG without inventing geolocation',()=>{
  const g=stacAffineGeolocate(detail,image,-110.9747,32.2226);
  assert.equal(g.state,'GEOLOCATED_STAC_AFFINE');
  assert.equal(g.quality,'COG_STAC_AFFINE_EPSG4326');
  assert.ok(g.pixel>=0&&g.pixel<image.getWidth());
  assert.ok(g.line>=0&&g.line<image.getHeight());
  assert.ok(g.residualDeg<1e-9);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCalibrationXml, parseProductXml, geolocateToPixel, calibrationLutAt, manifestProductAnnotations, manifestProductAnnotation, resolveRelativeSafeAsset } from '../src/sentinel1-calibration.mjs';

test('namespace-qualified SAFE calibration XML parses without DOM namespace assumptions', () => {
  const xml=`<s:calibration xmlns:s="urn:test"><s:absoluteCalibrationConstant>0</s:absoluteCalibrationConstant><s:calibrationVectorList><s:calibrationVector><s:azimuthTime>2026-01-01T00:00:00Z</s:azimuthTime><s:line>0</s:line><s:pixel>0 10</s:pixel><s:sigmaNought>1 3</s:sigmaNought><s:betaNought>2 4</s:betaNought><s:gamma>4 6</s:gamma><s:dn>1 1</s:dn></s:calibrationVector><s:calibrationVector><s:line>10</s:line><s:pixel>0 10</s:pixel><s:sigmaNought>3 5</s:sigmaNought><s:betaNought>4 6</s:betaNought><s:gamma>6 8</s:gamma><s:dn>1 1</s:dn></s:calibrationVector></s:calibrationVectorList></s:calibration>`;
  const cal=parseCalibrationXml(xml);
  assert.equal(cal.vectors.length,2);
  assert.equal(calibrationLutAt(cal,5,5,'sigmaNought'),3);
});

test('namespace-qualified SAFE product XML yields real geolocation points', () => {
  const point=(line,pixel,lat,lon)=>`<s:geolocationGridPoint><s:line>${line}</s:line><s:pixel>${pixel}</s:pixel><s:latitude>${lat}</s:latitude><s:longitude>${lon}</s:longitude><s:height>0</s:height><s:incidenceAngle>35</s:incidenceAngle></s:geolocationGridPoint>`;
  const xml=`<s:product xmlns:s="urn:test"><s:imageAnnotation><s:imageInformation><s:rangePixelSpacing>10</s:rangePixelSpacing><s:azimuthPixelSpacing>10</s:azimuthPixelSpacing><s:numberOfSamples>100</s:numberOfSamples><s:numberOfLines>100</s:numberOfLines></s:imageInformation></s:imageAnnotation><s:geolocationGrid><s:geolocationGridPointList>${point(0,0,1,0)}${point(0,10,1,1)}${point(10,0,0,0)}${point(10,10,0,1)}</s:geolocationGridPointList></s:geolocationGrid></s:product>`;
  const product=parseProductXml(xml);
  assert.equal(product.points.length,4);
  assert.equal(product.rangePixelSpacing,10);
  const g=geolocateToPixel(product,.25,.75);
  assert.equal(g.state,'GEOLOCATED_BILINEAR_GCP');
  assert.ok(Math.abs(g.pixel-2.5)<1e-6);
  assert.ok(Math.abs(g.line-2.5)<1e-6);
});

test('irregular product GCP grid falls back to local triangle interpolation without inventing a point', () => {
  const product={points:[
    {line:0,pixel:0,longitude:0,latitude:1},
    {line:0,pixel:12,longitude:1,latitude:1.02},
    {line:11,pixel:1,longitude:.02,latitude:0},
    {line:10,pixel:11,longitude:1.02,latitude:.03},
    {line:22,pixel:2,longitude:.03,latitude:-1},
    {line:21,pixel:13,longitude:1.03,latitude:-.98}
  ]};
  const g=geolocateToPixel(product,.4,.4);
  assert.ok(['GEOLOCATED_BILINEAR_GCP','GEOLOCATED_LOCAL_GCP_TRIANGLE'].includes(g.state));
  assert.ok(Number.isFinite(g.pixel));
  assert.ok(Number.isFinite(g.line));
  assert.ok(g.pixel>=0&&g.pixel<=13);
  assert.ok(g.line>=0&&g.line<=22);
});

test('geolocation stays unresolved when the target is outside GCP support', () => {
  const product={points:[
    {line:0,pixel:0,longitude:0,latitude:1},
    {line:0,pixel:10,longitude:1,latitude:1},
    {line:10,pixel:0,longitude:0,latitude:0},
    {line:10,pixel:10,longitude:1,latitude:0}
  ]};
  const g=geolocateToPixel(product,50,50);
  assert.equal(g.state,'GEOLOCATION_UNRESOLVED');
});

test('SAFE manifest recovery selects the root product annotation and never the RFI auxiliary XML', () => {
  const manifest=`<xfdu><dataObjectSection>
    <byteStream><fileLocation href="./annotation/rfi/rfi-iw-vh.xml"/></byteStream>
    <byteStream><fileLocation href="./annotation/calibration/calibration-iw-vh.xml"/></byteStream>
    <byteStream><fileLocation xlink:href="./annotation/s1d-iw-grd-vh-20260907t131154-20260907t131219-004472-0084aa-002.xml"/></byteStream>
    <byteStream><fileLocation href="./annotation/s1d-iw-grd-vv-20260907t131154-20260907t131219-004472-0084aa-001.xml"/></byteStream>
  </dataObjectSection></xfdu>`;
  const relative=manifestProductAnnotation(manifest,'vh');
  assert.equal(relative,'./annotation/s1d-iw-grd-vh-20260907t131154-20260907t131219-004472-0084aa-002.xml');
  assert.ok(!relative.includes('/rfi/'));
  const resolved=resolveRelativeSafeAsset('s3://sentinel-s1-l1c/GRD/2026/9/7/IW/DV/SCENE/manifest.safe',relative);
  assert.equal(resolved,'s3://sentinel-s1-l1c/GRD/2026/9/7/IW/DV/SCENE/annotation/s1d-iw-grd-vh-20260907t131154-20260907t131219-004472-0084aa-002.xml');
});

test('SAFE manifest exposes all plausible root annotation candidates for existence validation', () => {
  const manifest=`<xfdu><dataObjectSection>
    <fileLocation href="./annotation/rfi/s1d-iw-grd-vh-rfi.xml"/>
    <fileLocation href="./annotation/calibration/calibration-s1d-iw-grd-vh-scene.xml"/>
    <fileLocation href="./annotation/s1d-iw-grd-vh-scene-stale-002.xml"/>
    <fileLocation xlink:href="./annotation/s1d-iw-grd-vh-scene-existing-001.xml"/>
  </dataObjectSection></xfdu>`;
  assert.deepEqual(manifestProductAnnotations(manifest,'vh'),[
    './annotation/s1d-iw-grd-vh-scene-stale-002.xml',
    './annotation/s1d-iw-grd-vh-scene-existing-001.xml'
  ]);
});

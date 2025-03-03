import Projection from 'ol/proj/Projection';
import TileGrid from 'ol/tilegrid/TileGrid';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import { getTopLeft, getBottomLeft } from 'ol/extent';
import WKT from 'ol/format/WKT';
import numberFormatter from './utils/numberformatter';
import Style from './style';
import Popup from './popup';

const maputils = {
  isWithinVisibleScales: function isWithinVisibleScales(scale, maxScale, minScale) {
    if (maxScale || minScale) {
      // Alter 1: maxscale and minscale
      if (maxScale && minScale) {
        if ((scale > maxScale) && (scale < minScale)) {
          return true;
        }
      } else if (maxScale) {
        // Alter 2: only maxscale
        if (scale > maxScale) {
          return true;
        }
      } else if (minScale) {
        // Alter 3: only minscale
        if (scale < minScale) {
          return true;
        }
      }
    } else {
      // Alter 4: no scale limit
      return true;
    }
    return false;
  },
  customProjection: function customProjection(projectionCode, extent) {
    return new Projection({
      code: projectionCode,
      extent
    });
  },
  tileGrid: function tileGrid(settings, defaultSettings = {}) {
    const tileGridSettings = Object.assign({}, defaultSettings, settings);
    const extent = tileGridSettings.extent;
    tileGridSettings.origin = tileGridSettings.alignBottomLeft === false ? getTopLeft(extent) : getBottomLeft(extent);
    return new TileGrid(tileGridSettings);
  },
  checkZoomChange: function checkZoomChange(resolution, currentResolution) {
    if (resolution !== currentResolution) {
      return true;
    }

    return false;
  },
  createPointFeature: function createPointFeature(coordinate, style) {
    const feature = new Feature({
      geometry: new Point(coordinate)
    });
    feature.setStyle(style);
    return feature;
  },
  geojsonToFeature: function geojsonToFeature(obj) {
    const vectorSource = new Vector({
      features: (new GeoJSON()).readFeatures(obj)
    });
    return vectorSource.getFeatures();
  },
  geojsonToWkt: function geojsonToWkt(obj) {
    return (new WKT()).writeFeatures((new GeoJSON()).readFeatures(obj));
  },
  wktToFeature: function wktToFeature(wkt, srsName) {
    const format = new WKT();
    const feature = format.readFeature(wkt, {
      dataProjection: srsName,
      featureProjection: srsName
    });
    return feature;
  },
  getCenter: function getCenter(geometry) {
    const type = geometry.getType();
    let center;
    switch (type) {
      case 'Polygon':
        center = geometry.getInteriorPoint().getCoordinates();
        break;
      case 'MultiPolygon':
        center = geometry.getInteriorPoints().getFirstCoordinate();
        break;
      case 'Point':
        center = geometry.getCoordinates();
        break;
      case 'MultiPoint':
        center = geometry.getPoint(0).getCoordinates();
        break;
      case 'LineString':
        center = geometry.getCoordinateAt(0.5);
        break;
      case 'MultiLineString':
        center = geometry.getLineStrings()[0].getCoordinateAt(0.5);
        break;
      case 'Circle':
        center = geometry.getCenter();
        break;
      default:
        break;
    }
    return center;
  },
  resolutionToScale: function resolutionToScale(resolution, projection) {
    const dpi = 25.4 / 0.28;
    const mpu = projection.getMetersPerUnit();
    let scale = resolution * mpu * 39.37 * dpi;
    scale = Math.round(scale);
    return scale;
  },
  resolutionToFormattedScale: function resolutionToFormattedScale(resolution, projection) {
    const scale = this.roundScale(this.resolutionToScale(resolution, projection));
    return `1:${numberFormatter(scale)}`;
  },
  scaleToResolution: function scaleToResolution(scale, projection) {
    const dpi = 25.4 / 0.28;
    const mpu = projection.getMetersPerUnit();
    const resolution = scale / (mpu * 39.37 * dpi);
    return resolution;
  },
  roundScale: function roundScale(scale) {
    let scaleValue = scale;
    const differens = scaleValue % 10;
    if (differens !== 0) {
      scaleValue += (10 - differens);
    }
    return scaleValue;
  },
  createMarker: function createMarker(coordinates, title, content, viewer) {
    const featureStyles = {
      stroke: {
        color: [100, 149, 237, 1],
        width: 4,
        lineDash: null
      },
      fill: {
        color: [100, 149, 237, 0.2]
      },
      circle: {
        radius: 7,
        stroke: {
          color: [100, 149, 237, 1],
          width: 2
        },
        fill: {
          color: [255, 255, 255, 1]
        }
      }
    };
    const vectorStyles = Style.createStyleRule(featureStyles);
    const layer = new VectorLayer({
      source: new Vector({
        features: [
          new Feature({
            geometry: new Point(coordinates)
          })
        ]
      }),
      style: vectorStyles
    });
    const popup = Popup(`#${viewer.getId()}`);
    popup.setContent({
      content,
      title
    });
    popup.setTitle(title);
    popup.setVisibility(true);
    const popupEl = popup.getEl();
    const popupHeight = document.querySelector('.o-popup').offsetHeight + 10;
    popupEl.style.height = `${popupHeight}px`;
    const overlay = new Overlay({
      element: popupEl,
      autoPan: {
        margin: 55,
        animation: {
          duration: 500
        }
      },
      positioning: 'bottom-center'
    });
    viewer.getMap().addOverlay(overlay);
    overlay.setPosition(coordinates);
    return layer;
  }
};

export default maputils;

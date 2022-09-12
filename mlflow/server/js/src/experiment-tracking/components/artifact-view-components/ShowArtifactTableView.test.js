import React from 'react';
import { shallow, mount } from 'enzyme';
import { mountWithIntl } from 'src/common/utils/TestUtils';
import ShowArtifactTableView from './ShowArtifactTableView';
import Papa from 'papaparse';

describe('ShowArtifactTableView', () => {
  let wrapper;
  let minimalProps;
  let commonProps;

  beforeEach(() => {
    minimalProps = {
      path: 'fakePath.csv',
      runUuid: 'fakeUuid',
    };
    // Mock the `getArtifact` function to avoid spurious network errors
    // during testing
    const getArtifact = jest.fn((artifactLocation) => {
      return Promise.resolve('some content');
    });
    commonProps = { ...minimalProps, getArtifact };
    wrapper = shallow(<ShowArtifactTableView {...commonProps} />);
  });

  test('should render with minimal props without exploding', () => {
    wrapper = shallow(<ShowArtifactTableView {...minimalProps} />);
    expect(wrapper.length).toBe(1);
  });

  test('should render raw file text if parsing invalid CSV', (done) => {
    const fileContents = 'abcd\n&&&&&';
    const getArtifact = jest.fn((artifactLocation) => {
      return Promise.resolve(fileContents);
    });
    const props = { ...minimalProps, getArtifact };
    wrapper = mount(<ShowArtifactTableView {...props} />);
    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find('.ShowArtifactPage').length).toBe(1);
      expect(wrapper.find('.text-area-border-box').length).toBe(1);
      expect(wrapper.find('.text-area-border-box').text()).toBe(fileContents);
      done();
    });
  });

  test('should only render the first 500 rows when the number of rows is larger than 500', (done) => {
    const data = Array(600).fill({ a: 0, b: 1 });
    const fileContents = Papa.unparse(data);

    const getArtifact = jest.fn((artifactLocation) => {
      return Promise.resolve(fileContents);
    });
    const props = { ...minimalProps, getArtifact };
    wrapper = mountWithIntl(<ShowArtifactTableView {...props} />);
    setImmediate(() => {
      wrapper.update();
      expect(
        wrapper
          .find('tbody')
          .findWhere((n) => n.name() === 'tr' && n.prop('aria-hidden') !== 'true').length,
      ).toBe(500);
      done();
    });
  });

  test('should render CSV file correctly', (done) => {
    const data = Array(2).fill({ a: '0', b: '1' });
    const fileContents = Papa.unparse(data);

    const getArtifact = jest.fn((artifactLocation) => {
      return Promise.resolve(fileContents);
    });
    const props = { ...minimalProps, getArtifact };
    wrapper = mountWithIntl(<ShowArtifactTableView {...props} />);
    setImmediate(() => {
      wrapper.update();
      // Handle matching table headers
      const headerTextNodes = wrapper
        .find('thead')
        .find('tr')
        .findWhere((n) => n.name() === 'span' && n.text() !== '')
        .children();
      const csvHeaderValues = headerTextNodes.map((c) => c.text());
      expect(csvHeaderValues).toEqual(Object.keys(data[0]));

      // Handle matching row values
      const rowTextNodes = wrapper
        .find('tbody')
        .findWhere((n) => n.name() === 'tr' && n.prop('aria-hidden') !== 'true')
        .children();
      const csvPreviewValues = rowTextNodes.map((c) => c.text());
      const flatData = data.flatMap((d) => [d.a, d.b]);
      expect(csvPreviewValues).toEqual(flatData);
      done();
    });
  });

  test('should render TSV file correctly', (done) => {
    const data = Array(2).fill({ a: '0', b: '1' });
    const fileContents = Papa.unparse(data, { delimiter: '\t' });

    const getArtifact = jest.fn((artifactLocation) => {
      return Promise.resolve(fileContents);
    });
    const props = { ...minimalProps, getArtifact };
    wrapper = mountWithIntl(<ShowArtifactTableView {...props} />);
    setImmediate(() => {
      wrapper.update();
      // Handle matching table headers
      const headerTextNodes = wrapper
        .find('thead')
        .find('tr')
        .findWhere((n) => n.name() === 'span' && n.text() !== '')
        .children();
      const csvHeaderValues = headerTextNodes.map((c) => c.text());
      expect(csvHeaderValues).toEqual(Object.keys(data[0]));

      // Handle matching row values
      const rowTextNodes = wrapper
        .find('tbody')
        .findWhere((n) => n.name() === 'tr' && n.prop('aria-hidden') !== 'true')
        .children();
      const csvPreviewValues = rowTextNodes.map((c) => c.text());
      const flatData = data.flatMap((d) => [d.a, d.b]);
      expect(csvPreviewValues).toEqual(flatData);
      done();
    });
  });
});

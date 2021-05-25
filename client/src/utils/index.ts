import axios from 'axios';
import { notification } from 'antd';
import { Options, SeriesPieOptions, SeriesOptionsType } from 'highcharts';

import {
  User,
  Reports,
  ReportsData,
  AssetStatus,
  ChartTypes,
} from '../commons';

const colors = {
  red: '#E03C31',
  yellow: '#FFD800',
  green: '#9ACD32',
  blue: '#1890FF',
  lightGray: '#EEEEEE',
};

export const setStore = (name: string, content: unknown): void => {
  if (!name) return;
  const contentToStore =
    typeof content !== 'string' ? JSON.stringify(content) : content;
  return window.sessionStorage.setItem(name, contentToStore);
};

export const getStore = (name: string): unknown | undefined => {
  if (name) return JSON.parse(window.sessionStorage.getItem(name));
  return null;
};

export const removeItem = (name: string): void => {
  if (name) window.sessionStorage.removeItem(name);
};

export const openNotification = (
  args: Record<string, unknown>,
  type = 'open',
): void => {
  if (notification.hasOwnProperty(type)) {
    notification[type]({
      message: '',
      placement: 'topRight',
      duration: 0,
      ...args,
    });
  }
};

export const axiosSetup = (baseURL: string): void => {
  axios.defaults.baseURL = baseURL;
  axios.interceptors.request.use(req => {
    const user = getStore('user') as User;
    if (user && user.token) {
      req.headers['x-access-token'] = user.token;
    }
    return req;
  });
  axios.interceptors.response.use(
    res => res,
    error => {
      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          removeItem('user');
          if (window.location.href.indexOf('/login') < 0) {
            window.location.href = `${window.location.href}?unauthorized=${error.response.status}`;
            throw new Error('User unauthorized, please login');
          }
          throw error;
        } else if (error.response.status === 400) {
          let errorMessage = error.response.data;
          if (errorMessage.indexOf('duplicate key error') >= 0) {
            errorMessage = errorMessage
              .substring(errorMessage.lastIndexOf('dup key:'))
              .replace('dup key', 'Duplicate unique field');
          }
          throw new Error(`${errorMessage}`);
        } else {
          throw error;
        }
      }
    },
  );
};

export const getReportsFromData = (data: Array<ReportsData>): Reports => {
  const inOperationArray = data.filter(
    item => item.status === AssetStatus.IN_OPERATION,
  );

  const inAlertArray = data.filter(
    item => item.status === AssetStatus.IN_ALERT,
  );

  const inDowntimeArray = data.filter(
    item => item.status === AssetStatus.IN_DOWNTIME,
  );

  return {
    inOperation: inOperationArray.length ? inOperationArray[0] : null,
    inAlert: inAlertArray.length ? inAlertArray[0] : null,
    inDowntime: inDowntimeArray.length ? inDowntimeArray[0] : null,
  };
};

export const filterReportsDataBy = (
  data: Array<ReportsData>,
  field: string,
  value: unknown,
): Array<ReportsData> => data.filter(item => item[field] === value);

const getChartData = {
  bar: (name: string, report: ReportsData, color: string) => ({
    type: 'column',
    name: name,
    data: [report.averageHealth],
    color: color,
  }),
  pie: (name: string, report: ReportsData, color: string) => ({
    name: name,
    y: report.total,
    color: color,
  }),
};

const getSeriesData = {
  inOperation: (inOperation: ReportsData, type: ChartTypes) => {
    return getChartData[type]('In Operation', inOperation, colors.green);
  },
  inAlert: (inAlert: ReportsData, type: ChartTypes) => {
    return getChartData[type]('In Alert', inAlert, colors.yellow);
  },
  inDowntime: (inDowntime: ReportsData, type: ChartTypes) => {
    return getChartData[type]('In Downtime', inDowntime, colors.blue);
  },
};

export const getHealthChartOptions = (healthscore: number): unknown => {
  return {
    chart: {
      type: 'solidgauge',
      height: 200,
    },

    title: { text: '' },

    pane: {
      center: ['50%', '85%'],
      size: '140%',
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: colors.lightGray,
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc',
      },
    },

    credits: {
      enabled: false,
    },

    tooltip: {
      enabled: false,
    },

    yAxis: {
      stops: [
        [0.1, colors.red],
        [0.5, colors.yellow],
        [0.85, colors.green],
      ],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      title: {
        text: 'Health',
        y: 15,
      },
      labels: {
        y: 16,
      },
      min: 0,
      max: 100,
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true,
        },
      },
    },
    series: [
      {
        name: 'Health',
        data: [healthscore],
        dataLabels: {
          format:
            '<div style="text-align:center">' +
            '<span style="font-size:25px">{y}</span><br/>' +
            '<span style="font-size:12px;opacity:0.4">%</span>' +
            '</div>',
        },
        tooltip: {
          valueSuffix: ' %',
        },
      },
    ],
  };
};

export const getSummaryChartOptions = (
  title: string,
  data: Reports,
  chartToShow: Array<ChartTypes> = [ChartTypes.BAR, ChartTypes.PIE],
  height: number = null,
): Options => {
  const dataKeys = data ? Object.keys(data) : [];
  const options: Options = {
    title: {
      text: `${title}`,
    },
    annotations: [],
    chart: {
      height: height,
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: chartToShow.length > 1 && chartToShow.includes(ChartTypes.BAR),
    },
    responsive: {
      rules: [
        {
          condition: {
            maxHeight: 330,
          },
          chartOptions: {
            title: { text: '' },
            legend: {
              enabled: false,
            },
          },
        },
      ],
    },
    xAxis: {
      categories: ['Assets average health'],
    },
    yAxis: {
      title: {
        text: chartToShow.includes(ChartTypes.BAR) ? 'Health' : '',
      },
    },
    series: [],
  };
  if (chartToShow.includes(ChartTypes.BAR)) {
    dataKeys.forEach(key => {
      if (data[key] && getSeriesData.hasOwnProperty(key)) {
        options.series.push(getSeriesData[key](data[key], ChartTypes.BAR));
      }
    });
  }
  if (chartToShow.includes(ChartTypes.PIE)) {
    const pieSerie: SeriesPieOptions = {
      type: 'pie',
      name: 'Total',
      data: [],
      center: chartToShow.includes(ChartTypes.BAR) ? [50, 80] : ['50%', '50%'],
      size: 100,
      showInLegend: false,
      dataLabels: {
        enabled: false,
      },
    };
    dataKeys.forEach(key => {
      if (data[key] && getSeriesData.hasOwnProperty(key)) {
        pieSerie.data.push(getSeriesData[key](data[key], ChartTypes.PIE));
      }
    });
    if (pieSerie.data.length) {
      options.series.push(pieSerie);
      options.annotations.push({
        draggable: '',
        labels: [
          {
            point: chartToShow.includes(ChartTypes.BAR)
              ? { x: 70, y: 100 }
              : { x: 140, y: 90 },
            text: 'Assets total',
            x: 0,
            y: -85,
          },
        ],
      });
    }
  }
  return { ...options };
};

export const getDrilldownChartOptions = (
  mainSeries: Array<SeriesOptionsType>,
  drilldownSeries: Array<SeriesOptionsType>,
  field: string,
): unknown => {
  const options = {
    chart: {
      type: 'pie',
    },
    title: {
      text: `Assets average health by ${field}`,
    },
    subtitle: {
      text: 'Click the slices for more details',
    },
    accessibility: {
      announceNewData: {
        enabled: true,
      },
      point: {
        valueSuffix: '%',
      },
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.y:.1f}%',
        },
      },
    },

    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat:
        '<span style="color:{point.color}">{point.name}</span>: Average Health in <b>{point.y:.2f}%</b> <br/>',
      useHTML: true,
    },

    series: [
      {
        name: 'Average health',
        colorByPoint: true,
        data: mainSeries,
      },
    ],
    drilldown: {
      series: drilldownSeries,
    },
  };

  return { ...options };
};

export const placeHolderImg =
  'data:image/png;base64,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';

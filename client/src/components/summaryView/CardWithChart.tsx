import { FC, ReactNode, CSSProperties, useState, useEffect } from 'react';
import { Card, Tooltip, Spin } from 'antd';
import {
  PieChartOutlined,
  EditOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useHistory } from 'react-router';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import './CardWithChart.css';
import { Reports, ChartTypes } from '../../commons';
import { getSummaryChartOptions, getHealthChartOptions } from '../../utils';

interface CardWithChartProps {
  data?: Reports | number;
  highcharts?: typeof Highcharts;
  isLoadingReports?: boolean;
  currentChart?: ChartTypes;
  editRoute?: string;
  showChart?: boolean;
  healthChart?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

const CardWithChart: FC<CardWithChartProps> = ({
  data,
  highcharts,
  currentChart,
  editRoute = '',
  showChart = true,
  healthChart = false,
  isLoadingReports = false,
  children,
  style,
}: CardWithChartProps) => {
  const [chartToShow, setChartToShow] = useState(ChartTypes.BAR);
  const [options, setOptions] = useState({});
  const history = useHistory();

  useEffect(() => {
    setOptions(
      healthChart
        ? getHealthChartOptions(data as number)
        : getSummaryChartOptions('', data as Reports, [chartToShow], 200),
    );
  }, [data, chartToShow, healthChart]);

  useEffect(() => {
    if (currentChart) {
      setChartToShow(currentChart);
    }
  }, [currentChart]);

  const changeChart = (chart: ChartTypes) => {
    setChartToShow(chart);
  };

  const actions =
    healthChart || !showChart
      ? []
      : [
          <Tooltip key='assetsHealth' placement='top' title='Average health'>
            <BarChartOutlined
              style={{
                color:
                  chartToShow === ChartTypes.BAR
                    ? '#1890ff'
                    : 'rgba(0, 0, 0, 0.45)',
              }}
              onClick={() => changeChart(ChartTypes.BAR)}
            />
          </Tooltip>,
          <Tooltip key='totalAssets' placement='top' title='Assets total'>
            <PieChartOutlined
              style={{
                color:
                  chartToShow === ChartTypes.PIE
                    ? '#1890ff'
                    : 'rgba(0, 0, 0, 0.45)',
              }}
              onClick={() => changeChart(ChartTypes.PIE)}
            />
          </Tooltip>,
        ];

  if (editRoute) {
    actions.push(
      <Tooltip key='edit' placement='top' title={'Edit'}>
        <EditOutlined onClick={() => history.push(editRoute)} />
      </Tooltip>,
    );
  }

  return (
    <Card
      style={{ width: 300, margin: '10px', ...style }}
      className='card-with-chart'
      cover={
        showChart && (
          <Spin spinning={isLoadingReports} delay={500}>
            <HighchartsReact highcharts={highcharts} options={options} />
          </Spin>
        )
      }
      actions={actions}
    >
      {children}
    </Card>
  );
};

export default CardWithChart;

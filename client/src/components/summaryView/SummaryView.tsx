import { FC, ReactNode, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import {
  Row,
  Col,
  Spin,
  Radio,
  Button,
  Divider,
  Tooltip,
  PageHeader,
  Pagination,
} from 'antd';
import {
  PlusOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import Highcharts, { Options } from 'highcharts';
import noData from 'highcharts/modules/no-data-to-display';
import drilldown from 'highcharts/modules/drilldown';
import annotations from 'highcharts/modules/annotations';
import exportModule from 'highcharts/modules/exporting';
import exportOffline from 'highcharts/modules/offline-exporting';
import highchartsMore from 'highcharts/highcharts-more';
import highchartsSolidGauge from 'highcharts/modules/solid-gauge';
import HighchartsReact from 'highcharts-react-official';
import pluralize from 'pluralize';

import './SummaryView.css';
import { ChartTypes, Reports } from '../../commons';
import { getSummaryChartOptions } from '../../utils';

// Highcharts modules
noData(Highcharts);
annotations(Highcharts);
drilldown(Highcharts);
exportModule(Highcharts);
exportOffline(Highcharts);
highchartsMore(Highcharts);
highchartsSolidGauge(Highcharts);

interface SummaryViewProps {
  name: string;
  summaryData?: Reports;
  currentPage: number;
  pageSize: number;
  pageTotal: number;
  isLoadingContent: boolean;
  isLoadingSummary?: boolean;
  showSummaryChart?: boolean;
  onChangePage: (page: number, size: number) => void;
  onChangeCurrentChart?: (currentChart: ChartTypes) => void;
  showChartSelectors?: boolean;
  addRoute?: string;
  dividerText?: string;
  children?: ReactNode;
}

const SummaryView: FC<SummaryViewProps> = ({
  name,
  summaryData,
  currentPage,
  pageSize,
  pageTotal,
  isLoadingContent,
  isLoadingSummary,
  showSummaryChart = true,
  onChangePage,
  onChangeCurrentChart = undefined,
  showChartSelectors = true,
  addRoute,
  dividerText,
  children,
}: SummaryViewProps) => {
  const [currentChart, setCurrentChart] = useState(ChartTypes.BAR);
  const [options, setOptions] = useState<Options>();
  const pluralName = pluralize(name);
  const history = useHistory();

  useEffect(() => {
    if (summaryData) {
      setOptions(
        getSummaryChartOptions('Assets health and status summary', summaryData),
      );
    }
  }, [summaryData]);

  const onChangeChart = e => {
    const newChart = e.target.value;
    setCurrentChart(newChart);
    if (onChangeCurrentChart) {
      onChangeCurrentChart(newChart);
    }
  };

  const listActions = (
    <Row justify='space-between' align='middle'>
      <Col>
        {showChartSelectors && (
          <Radio.Group value={currentChart} onChange={onChangeChart}>
            <Tooltip placement='bottom' title='Average Health'>
              <Radio.Button value={ChartTypes.BAR}>
                <BarChartOutlined />
              </Radio.Button>
            </Tooltip>
            <Tooltip placement='bottom' title='Assets total'>
              <Radio.Button value={ChartTypes.PIE}>
                <PieChartOutlined />
              </Radio.Button>
            </Tooltip>
          </Radio.Group>
        )}
      </Col>
      <Col>
        <Pagination
          current={currentPage}
          onChange={(page, size) => onChangePage(page, size)}
          pageSize={pageSize}
          showSizeChanger={false}
          total={pageTotal}
        />
      </Col>
    </Row>
  );

  return (
    <>
      <PageHeader
        backIcon={false}
        className='page-header'
        title={pluralName}
        subTitle='view'
        extra={
          addRoute
            ? [
                <Button
                  onClick={() => history.push(addRoute)}
                  key='new'
                  icon={<PlusOutlined />}
                  type='primary'
                >
                  New {name}
                </Button>,
              ]
            : []
        }
      />
      {showSummaryChart && (
        <Row justify='center' align='middle'>
          <Col lg={{ span: 24 }} xl={{ span: 18 }}>
            <Spin size='large' spinning={isLoadingSummary} delay={500}>
              <HighchartsReact highcharts={Highcharts} options={options} />
            </Spin>
          </Col>
        </Row>
      )}
      <Divider>{dividerText ? dividerText : `${pluralName} list`}</Divider>
      <Spin size='large' spinning={isLoadingContent} delay={500}>
        {children ? (
          <>
            {listActions}
            <br />
            <div className='flex-container'>{children}</div>
            <br />
            {listActions}
          </>
        ) : (
          <div className='text-center'>
            <h3>No data to display</h3>
          </div>
        )}
      </Spin>
    </>
  );
};

export default SummaryView;

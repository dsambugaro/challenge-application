import { FC, useState, useEffect } from 'react';
import Highcharts, { Options } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios, { AxiosResponse } from 'axios';
import { connect } from 'react-redux';
import { Spin, Divider, PageHeader } from 'antd';

import './Dashboard.css';
import { ReportsData, WithUserProps, UserRole } from '../../commons';
import {
  getReportsFromData,
  filterReportsDataBy,
  openNotification,
  getDrilldownChartOptions,
} from '../../utils';
import { endPoints } from '../../services';
import { RootState } from '../../store';

const DashboardView: FC<WithUserProps> = ({ user }: WithUserProps) => {
  const [options, setOptions] = useState<Record<string, Options>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const graphsBy = () => {
    if (user.role === UserRole.ADMIN) {
      return ['company', 'unit'];
    }
    if (user.role === UserRole.MANAGER) {
      return ['unit', 'user'];
    }
    return ['unit'];
  };

  const getOptions = (
    reportData: Array<ReportsData>,
    reportDataToDrill: Array<ReportsData>,
    field: string,
  ) => {
    const mainseries = [];
    const drilldownSeries = [];
    reportData.forEach(data => {
      const seriesName = `${field} ${data[field]}`;
      mainseries.push({
        name: seriesName,
        y: data.averageHealth,
        drilldown: seriesName,
      });
      const drilldownData = getReportsFromData(
        filterReportsDataBy(reportDataToDrill, field, data[field]),
      );
      drilldownSeries.push({
        name: seriesName,
        id: seriesName,
        data: [
          drilldownData.inOperation
            ? ['In Operation', drilldownData.inOperation.averageHealth]
            : [],
          drilldownData.inAlert
            ? ['In Alert', drilldownData.inAlert.averageHealth]
            : [],
          drilldownData.inDowntime
            ? ['In Downtime', drilldownData.inDowntime.averageHealth]
            : [],
        ],
      });
    });
    setOptions({
      [field]: getDrilldownChartOptions(mainseries, drilldownSeries, field),
    });
    setIsLoading(false);
  };

  const getDrillByField = (field: string) => {
    setIsLoading(true);
    axios
      .request(endPoints.reports([field]))
      .then((response: AxiosResponse<Array<ReportsData>>) => {
        if (response && response.status === 200) {
          axios
            .request(endPoints.reports([field, 'status']))
            .then((responseDrill: AxiosResponse<Array<ReportsData>>) => {
              if (responseDrill && responseDrill.status === 200) {
                getOptions(response.data, responseDrill.data, field);
              }
            })
            .catch(error => {
              openNotification({ message: `${error}` }, 'error');
              setIsLoading(false);
            });
        }
      })
      .catch(error => {
        openNotification({ message: `${error}` }, 'error');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    graphsBy().forEach(by => {
      getDrillByField(by);
    });
  }, []); // eslint-disable-line

  return (
    <>
      <PageHeader
        backIcon={false}
        className='page-header'
        title={'Dashboard'}
        subTitle='Summaries'
        extra={[]}
      />
      <Divider></Divider>
      <div className='dashboard-wrapper'>
        {graphsBy().map(by => {
          return (
            <div key={by} className='chart-wrapper'>
              <Spin spinning={isLoading} size='large'>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={options[by] ? options[by] : {}}
                />
              </Spin>
            </div>
          );
        })}
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

export default connect(mapStateToProps)(DashboardView);

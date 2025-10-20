// src/lib/admin_orders/pdfGenerator.ts

import { ReportData } from './ReportService';

/**
 * Генерация PDF отчета с поддержкой кириллицы
 * Используется pdfmake
 */
export async function generateWarehousePDF(reportData: ReportData, language: 'ru' | 'kz' = 'ru'): Promise<void> {
  try {
    // Динамический импорт pdfmake - ИСПРАВЛЕННАЯ ВЕРСИЯ
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    
    // Правильный способ доступа к pdfMake
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const vfs = pdfFontsModule.default?.vfs || (pdfFontsModule as any).pdfMake?.vfs;
    
    if (vfs) {
      pdfMake.vfs = vfs;
    }

    // Переводы
    const t = (key: string) => {
      const translations: Record<string, Record<string, string>> = {
        ru: {
          title: 'СКЛАДСКОЙ ОТЧЕТ',
          period: 'Период',
          from: 'с',
          to: 'по',
          generatedBy: 'Составил',
          generatedAt: 'Дата создания',
          summary: 'СВОДКА',
          totalOrders: 'Всего заказов',
          totalAmount: 'Общая сумма',
          totalItems: 'Всего товаров',
          ordersList: 'СПИСОК ЗАКАЗОВ',
          orderNum: '№',
          date: 'Дата',
          client: 'Клиент',
          phone: 'Телефон',
          items: 'Товары',
          amount: 'Сумма',
          status: 'Статус',
          statusBreakdown: 'Статистика по статусам',
          new: 'Новый',
          confirmed: 'Подтвержден',
          processing: 'В обработке',
          transferred_to_warehouse: 'Передан в склад',
          packed: 'Упакован',
          ready_for_pickup: 'Готов к выдаче',
          shipped: 'Отправлен',
          delivered: 'Доставлен',
          cancelled: 'Отменен',
          returned: 'Возврат',
          page: 'Страница'
        },
        kz: {
          title: 'ҚОЙМА ЕСЕБІ',
          period: 'Кезең',
          from: 'бастап',
          to: 'дейін',
          generatedBy: 'Құрастырған',
          generatedAt: 'Жасалған күні',
          summary: 'ҚОРЫТЫНДЫ',
          totalOrders: 'Барлығы тапсырыстар',
          totalAmount: 'Жалпы сома',
          totalItems: 'Барлығы тауарлар',
          ordersList: 'ТАПСЫРЫСТАР ТІЗІМІ',
          orderNum: '№',
          date: 'Күні',
          client: 'Клиент',
          phone: 'Телефон',
          items: 'Тауарлар',
          amount: 'Сома',
          status: 'Мәртебе',
          statusBreakdown: 'Мәртебе бойынша статистика',
          new: 'Жаңа',
          confirmed: 'Расталған',
          processing: 'Өңдеуде',
          transferred_to_warehouse: 'Қоймаға тапсырылды',
          packed: 'Орамалған',
          ready_for_pickup: 'Беруге дайын',
          shipped: 'Жөнелтілді',
          delivered: 'Жеткізілді',
          cancelled: 'Жойылды',
          returned: 'Қайтару',
          page: 'Бет'
        }
      };
      return translations[language][key] || key;
    };

    // Форматирование даты
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatDateShort = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Данные для таблицы
    const tableData = reportData.orders.map((order, index) => {
      const clientName = `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim() || '-';
      const phone = order.user?.phone || '-';
      const itemsCount = order.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      const status = t(order.order_status || 'new');

      return [
        { text: (index + 1).toString(), fontSize: 8, alignment: 'center' },
        { text: formatDateShort(order.created_at), fontSize: 8, alignment: 'center' },
        { text: clientName, fontSize: 8 },
        { text: phone, fontSize: 8, alignment: 'center' },
        { text: itemsCount.toString(), fontSize: 8, alignment: 'center' },
        { text: (order.total_amount || 0).toLocaleString() + ' ₸', fontSize: 8, alignment: 'right' },
        { text: status, fontSize: 8, alignment: 'center' }
      ];
    });

    // Статистика по статусам
    const statusRows = Object.entries(reportData.summary.byStatus).map(([status, count]) => {
      return [
        { text: t(status), fontSize: 9, color: '#333333' },
        { text: count.toString(), fontSize: 9, bold: true, color: '#D77E6C', alignment: 'right' }
      ];
    });

    // Определение документа
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      
      header: function(currentPage: number, pageCount: number) {
        return {
          text: `${t('page')} ${currentPage} / ${pageCount}`,
          alignment: 'center',
          margin: [0, 20, 0, 0],
          fontSize: 8,
          color: '#666666'
        };
      },

      content: [
        // ЗАГОЛОВОК
        {
          text: t('title'),
          fontSize: 20,
          bold: true,
          color: '#333333',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },

        // ПЕРИОД
        {
          text: `${t('period')}: ${t('from')} ${formatDate(reportData.filters.startDate)} ${t('to')} ${formatDate(reportData.filters.endDate)}`,
          fontSize: 10,
          color: '#666666',
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },

        // СОСТАВИТЕЛЬ
        {
          text: `${t('generatedBy')}: ${reportData.generatedBy}`,
          fontSize: 10,
          color: '#666666',
          alignment: 'center',
          margin: [0, 0, 0, 3]
        },

        // ДАТА СОЗДАНИЯ
        {
          text: `${t('generatedAt')}: ${formatDate(reportData.generatedAt)}`,
          fontSize: 10,
          color: '#666666',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        // СВОДКА - ФОНОВЫЙ ПРЯМОУГОЛЬНИК
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 515,
              h: 80,
              r: 5,
              color: '#F5F5F5'
            }
          ],
          margin: [0, 0, 0, 0]
        },
        
        // СВОДКА - ЗАГОЛОВОК
        {
          text: t('summary'),
          fontSize: 14,
          bold: true,
          color: '#333333',
          alignment: 'center',
          margin: [0, -70, 0, 10]
        },
        
        // СВОДКА - ДАННЫЕ
        {
          columns: [
            {
              width: '33%',
              stack: [
                { text: t('totalOrders'), fontSize: 10, color: '#666666', alignment: 'center' },
                { text: reportData.summary.totalOrders.toString(), fontSize: 14, bold: true, color: '#D77E6C', alignment: 'center', margin: [0, 5, 0, 0] }
              ]
            },
            {
              width: '33%',
              stack: [
                { text: t('totalItems'), fontSize: 10, color: '#666666', alignment: 'center' },
                { text: reportData.summary.totalItems.toString(), fontSize: 14, bold: true, color: '#D77E6C', alignment: 'center', margin: [0, 5, 0, 0] }
              ]
            },
            {
              width: '34%',
              stack: [
                { text: t('totalAmount'), fontSize: 10, color: '#666666', alignment: 'center' },
                { text: `${reportData.summary.totalAmount.toLocaleString()} ₸`, fontSize: 14, bold: true, color: '#D77E6C', alignment: 'center', margin: [0, 5, 0, 0] }
              ]
            }
          ],
          margin: [0, -50, 0, 30]
        },

        // СТАТИСТИКА ПО СТАТУСАМ
        ...(statusRows.length > 0 ? [
          {
            text: t('statusBreakdown'),
            fontSize: 14,
            bold: true,
            color: '#333333',
            margin: [0, 10, 0, 10]
          },
          {
            columns: [
              {
                width: '50%',
                table: {
                  widths: ['*', 50],
                  body: statusRows.slice(0, Math.ceil(statusRows.length / 2))
                },
                layout: 'lightHorizontalLines'
              },
              {
                width: '50%',
                table: {
                  widths: ['*', 50],
                  body: statusRows.slice(Math.ceil(statusRows.length / 2))
                },
                layout: statusRows.length > Math.ceil(statusRows.length / 2) ? 'lightHorizontalLines' : 'noBorders',
                margin: [10, 0, 0, 0]
              }
            ],
            margin: [0, 0, 0, 20]
          }
        ] : []),

        // СПИСОК ЗАКАЗОВ
        {
          text: t('ordersList'),
          fontSize: 14,
          bold: true,
          color: '#333333',
          margin: [0, 20, 0, 10]
        },

        // ТАБЛИЦА ЗАКАЗОВ
        {
          table: {
            headerRows: 1,
            widths: [25, 60, '*', 70, 40, 70, 80],
            body: [
              // Заголовок
              [
                { text: t('orderNum'), fontSize: 9, bold: true, color: '#FFFFFF', alignment: 'center' },
                { text: t('date'), fontSize: 9, bold: true, color: '#FFFFFF', alignment: 'center' },
                { text: t('client'), fontSize: 9, bold: true, color: '#FFFFFF', alignment: 'center' },
                { text: t('phone'), fontSize: 9, bold: true, color: '#FFFFFF', alignment: 'center' },
                { text: t('items'), fontSize: 9, bold: true, color: '#FFFFFF', alignment: 'center' },
                { text: t('amount'), fontSize: 9, bold: true, color: '#FFFFFF', alignment: 'center' },
                { text: t('status'), fontSize: 9, bold: true, color: '#FFFFFF', alignment: 'center' }
              ],
              // Данные
              ...tableData
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex === 0 ? '#D77E6C' : (rowIndex % 2 === 0 ? '#F9F9F9' : null);
            },
            hLineColor: function () {
              return '#E0E0E0';
            },
            vLineColor: function () {
              return '#E0E0E0';
            }
          }
        }
      ],

      defaultStyle: {
        font: 'Roboto'
      }
    };

    // Генерируем и скачиваем PDF
    const fileName = `warehouse_report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);

    console.log('✅ PDF report generated:', fileName);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
}

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CorePage } from './core.page';

describe('CorePage', () => {
  let component: CorePage;
  let fixture: ComponentFixture<CorePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
